import Activity from '../models/Activity.js';
import Submission from '../models/Submission.js';
import axios from 'axios';

// ACTIVITY CONTROLLERS

export const getActivitiesByCourse = async (req, res) => {
  try {
    const activities = await Activity.find({ courseId: req.params.courseId }).sort({ dueDate: 1 });
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createActivity = async (req, res) => {
  try {
    const activityData = { ...req.body, courseId: req.params.courseId };
    const activity = await Activity.create(activityData);
    
    // Send email notification to all enrolled students (fire and forget - don't wait for completion)
    sendNewActivityEmail(activity, req.body).catch(err => {
      console.error('⚠️ Email notification failed (non-blocking):', err.message);
    });
    
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper function to send email notification
async function sendNewActivityEmail(activity, requestBody) {
  try {
    console.log('📧 Triggering email notification for new activity:', activity.title);
    
    const emailData = {
      _id: activity._id,
      activityId: activity.activityId,
      courseId: activity.courseId,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      dueDate: activity.dueDate,
      totalPoints: activity.totalPoints,
      courseName: requestBody.courseName || 'Unknown Course',
      courseCode: requestBody.courseCode || 'N/A',
      instructorName: requestBody.instructorName || 'Your Instructor'
    };

    // Call email service
    await axios.post('http://localhost:1008/api/email/send-activity-notification', emailData);
    
    console.log('✅ Email notification triggered successfully');
  } catch (error) {
    console.error('❌ Failed to send email notification:', error.message);
    // Don't throw error - email failure should not block activity creation
  }
}

export const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.status(200).json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SUBMISSION CONTROLLERS

// Get all submissions
export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find();
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubmissionsByActivity = async (req, res) => {
  try {
    const submissions = await Submission.find({ activityId: req.params.activityId });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('activityId');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubmission = async (req, res) => {
  try {
    // Get activityId from either route params or request body
    const activityId = req.params.activityId || req.body.activityId;
    
    if (!activityId) {
      return res.status(400).json({ message: 'Activity ID is required' });
    }

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if submission is late
    const isLate = new Date() > activity.dueDate;
    if (isLate && !activity.allowLateSubmission) {
      return res.status(400).json({ message: 'Late submissions are not allowed for this activity' });
    }

    const submissionData = {
      ...req.body,
      activityId: activityId,
      isLate
    };

    console.log('💾 Creating submission:', submissionData);

    const submission = await Submission.create(submissionData);
    
    console.log('✅ Submission created successfully:', submission._id);
    
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    console.error('❌ Error creating submission:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already submitted this activity' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.params.studentId })
      .populate('activityId')
      .sort({ submittedAt: -1 });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GRADING CONTROLLERS

export const gradeSubmission = async (req, res) => {
  try {
    const { score, feedback, gradedBy } = req.body;

    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const activity = await Activity.findById(submission.activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Validate score
    if (score > activity.totalPoints) {
      return res.status(400).json({ message: `Score cannot exceed ${activity.totalPoints} points` });
    }

    // Apply late penalty if applicable
    let finalScore = score;
    if (submission.isLate && activity.latePenalty > 0) {
      finalScore = Math.max(0, score - activity.latePenalty);
    }

    submission.score = finalScore;
    submission.feedback = feedback;
    submission.gradedBy = gradedBy;
    submission.gradedAt = Date.now();
    submission.status = 'graded';

    await submission.save();

    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCourseGrades = async (req, res) => {
  try {
    const activities = await Activity.find({ courseId: req.params.courseId });
    const activityIds = activities.map(a => a._id);
    
    const submissions = await Submission.find({ 
      activityId: { $in: activityIds },
      status: 'graded'
    }).populate('activityId');

    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentGrades = async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      studentId: req.params.studentId,
      status: 'graded'
    }).populate('activityId');

    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
