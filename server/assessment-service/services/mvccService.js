import Activity from '../models/Activity.js';
import Submission from '../models/Submission.js';

/**
 * MVCC (Multi-Version Concurrency Control) Service
 * Handles concurrent submission attempts with version checking and retry logic
 */

class MVCCService {
  constructor() {
    this.MAX_RETRIES = 3;
    this.BACKOFF_DELAYS = [50, 100, 200]; // Delays in milliseconds
    this.stats = {
      totalAttempts: 0,
      successfulSubmissions: 0,
      conflicts: 0,
      retriesSucceeded: 0,
      retriesFailed: 0
    };
  }

  /**
   * Submit with MVCC protection
   * @param {Object} submissionData - The submission data
   * @returns {Promise<Object>} The created submission or error
   */
  async submitWithMVCC(submissionData) {
    this.stats.totalAttempts++;
    
    let lastError = null;
    
    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 MVCC Attempt ${attempt + 1}/${this.MAX_RETRIES + 1} for student ${submissionData.studentId}`);
        
        const result = await this._attemptSubmission(submissionData);
        
        if (attempt > 0) {
          this.stats.retriesSucceeded++;
          console.log(`✅ MVCC Retry succeeded on attempt ${attempt + 1}`);
        } else {
          this.stats.successfulSubmissions++;
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        // Check if it's a version conflict
        if (error.isVersionConflict) {
          this.stats.conflicts++;
          console.log(`⚠️ MVCC Conflict detected on attempt ${attempt + 1}: ${error.message}`);
          
          // If we have retries left, wait and try again
          if (attempt < this.MAX_RETRIES) {
            const delay = this.BACKOFF_DELAYS[attempt];
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await this._sleep(delay);
            continue;
          } else {
            this.stats.retriesFailed++;
            console.log(`❌ MVCC Max retries (${this.MAX_RETRIES}) exceeded`);
          }
        }
        
        // If it's not a version conflict or we're out of retries, throw the error
        throw error;
      }
    }
    
    throw lastError;
  }

  /**
   * Internal method to attempt a submission
   * @private
   */
  async _attemptSubmission(submissionData) {
    const { activityId, studentId } = submissionData;

    // STEP 1: Read current state with version
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw this._createError('Activity not found', 404);
    }

    const currentVersion = activity.__version;
    const totalSubmissions = activity.totalSubmissions;
    const maxAttempts = activity.maxAttempts;

    console.log(`📊 Activity state - Version: ${currentVersion}, Submissions: ${totalSubmissions}, Max Attempts: ${maxAttempts}`);

    // STEP 2: Check student's existing attempts
    const existingAttempts = await Submission.countDocuments({ 
      activityId, 
      studentId 
    });

    console.log(`📝 Student has ${existingAttempts} existing attempts`);

    // STEP 3: Business validation
    if (existingAttempts >= maxAttempts) {
      throw this._createError(
        `Maximum attempts (${maxAttempts}) reached for this activity`,
        400,
        'MAX_ATTEMPTS_EXCEEDED'
      );
    }

    // Check if submission is late
    const isLate = new Date() > activity.dueDate;
    if (isLate && !activity.allowLateSubmission) {
      throw this._createError('Late submissions are not allowed for this activity', 400);
    }

    // Check if activity is published
    if (!activity.isPublished) {
      throw this._createError('Activity is not published yet', 400);
    }

    // STEP 4: Prepare submission data
    const submissionToCreate = {
      ...submissionData,
      activityId,
      studentId,
      isLate,
      attemptNumber: existingAttempts + 1,
      __version: 1
    };

    // STEP 5: Attempt atomic update with version check
    const updateResult = await Activity.findOneAndUpdate(
      { 
        _id: activityId, 
        __version: currentVersion // Version check condition
      },
      { 
        $inc: { 
          __version: 1,
          totalSubmissions: 1 
        }
      },
      { 
        new: false, // Return old document to verify version match
        runValidators: true 
      }
    );

    // STEP 6: Check if update succeeded (version matched)
    if (!updateResult) {
      // Version conflict - someone else updated the activity
      const conflictError = this._createError(
        'Version conflict: Activity was updated by another transaction',
        409,
        'VERSION_CONFLICT'
      );
      conflictError.isVersionConflict = true;
      throw conflictError;
    }

    console.log(`✅ Version check passed - Updated from v${currentVersion} to v${currentVersion + 1}`);

    // STEP 7: Create the submission
    try {
      const submission = await Submission.create(submissionToCreate);
      
      console.log(`✅ Submission created successfully - ID: ${submission._id}, Attempt: ${submission.attemptNumber}`);
      
      return {
        success: true,
        data: submission,
        mvccInfo: {
          activityVersion: currentVersion + 1,
          attemptNumber: submission.attemptNumber,
          totalSubmissions: totalSubmissions + 1,
          retriesUsed: 0
        }
      };
      
    } catch (submissionError) {
      // If submission creation fails, rollback the activity update
      console.error('❌ Submission creation failed, rolling back activity update');
      
      await Activity.findByIdAndUpdate(
        activityId,
        { 
          $inc: { 
            __version: 1,
            totalSubmissions: -1 
          }
        }
      );
      
      // Check for duplicate submission error
      if (submissionError.code === 11000) {
        throw this._createError('You have already submitted this activity', 400, 'DUPLICATE_SUBMISSION');
      }
      
      throw submissionError;
    }
  }

  /**
   * Get a submission with version info
   */
  async getSubmissionWithVersion(submissionId) {
    const submission = await Submission.findById(submissionId).populate('activityId');
    if (!submission) {
      throw this._createError('Submission not found', 404);
    }
    
    return {
      success: true,
      data: submission,
      mvccInfo: {
        submissionVersion: submission.__version,
        activityVersion: submission.activityId.__version
      }
    };
  }

  /**
   * Update submission with version check (for resubmissions)
   */
  async updateSubmissionWithMVCC(submissionId, updateData, expectedVersion) {
    const result = await Submission.findOneAndUpdate(
      { 
        _id: submissionId,
        __version: expectedVersion
      },
      {
        ...updateData,
        $inc: { __version: 1 }
      },
      { new: true, runValidators: true }
    );

    if (!result) {
      const conflictError = this._createError(
        'Version conflict: Submission was updated by another transaction',
        409,
        'VERSION_CONFLICT'
      );
      conflictError.isVersionConflict = true;
      throw conflictError;
    }

    return {
      success: true,
      data: result,
      mvccInfo: {
        previousVersion: expectedVersion,
        currentVersion: result.__version
      }
    };
  }

  /**
   * Get MVCC statistics
   */
  getStats() {
    const conflictRate = this.stats.totalAttempts > 0 
      ? (this.stats.conflicts / this.stats.totalAttempts * 100).toFixed(2) 
      : 0;
    
    const retrySuccessRate = this.stats.conflicts > 0
      ? (this.stats.retriesSucceeded / this.stats.conflicts * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      conflictRate: `${conflictRate}%`,
      retrySuccessRate: `${retrySuccessRate}%`
    };
  }

  /**
   * Reset statistics (useful for testing)
   */
  resetStats() {
    this.stats = {
      totalAttempts: 0,
      successfulSubmissions: 0,
      conflicts: 0,
      retriesSucceeded: 0,
      retriesFailed: 0
    };
  }

  /**
   * Helper: Sleep for specified milliseconds
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper: Create standardized error object
   * @private
   */
  _createError(message, statusCode = 400, code = null) {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (code) error.code = code;
    return error;
  }
}

// Export singleton instance
export default new MVCCService();
