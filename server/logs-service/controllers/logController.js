import Log from '../models/Log.js';

// Create new log
export const createLog = async (req, res) => {
  try {
    const log = await Log.create(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(400).json({ success: false, message: 'Failed to create log', error: error.message });
  }
};

// Get all logs with filters
export const getAllLogs = async (req, res) => {
  try {
    const {
      userRole,
      actionType,
      resource,
      status,
      userEmail,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};
    
    if (userRole) filter.userRole = userRole;
    if (actionType) filter.actionType = actionType;
    if (resource) filter.resource = resource;
    if (status) filter.status = status;
    if (userEmail) filter.userEmail = new RegExp(userEmail, 'i');
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const logs = await Log.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Log.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch logs', error: error.message });
  }
};

// Get single log by ID
export const getLogById = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    console.error('Error fetching log:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch log', error: error.message });
  }
};

// Get logs by user
export const getLogsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await Log.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Log.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user logs', error: error.message });
  }
};

// Get logs by action type
export const getLogsByAction = async (req, res) => {
  try {
    const { actionType } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await Log.find({ actionType })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Log.countDocuments({ actionType });

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching action logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch action logs', error: error.message });
  }
};

// Delete single log
export const deleteLog = async (req, res) => {
  try {
    const log = await Log.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }
    res.status(200).json({ success: true, message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ success: false, message: 'Failed to delete log', error: error.message });
  }
};

// Bulk delete logs
export const deleteLogs = async (req, res) => {
  try {
    const { ids, olderThan } = req.body;
    
    let result;
    if (ids && ids.length > 0) {
      // Delete specific logs by IDs
      result = await Log.deleteMany({ _id: { $in: ids } });
    } else if (olderThan) {
      // Delete logs older than specified date
      result = await Log.deleteMany({ createdAt: { $lt: new Date(olderThan) } });
    } else {
      return res.status(400).json({ success: false, message: 'Please provide ids or olderThan parameter' });
    }

    res.status(200).json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} log(s) successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting logs:', error);
    res.status(500).json({ success: false, message: 'Failed to delete logs', error: error.message });
  }
};

// Get log statistics
export const getLogStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get total count
    const total = await Log.countDocuments(dateFilter);

    // Count by action type
    const byActionType = await Log.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$actionType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Count by user role
    const byUserRole = await Log.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$userRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Count by resource
    const byResource = await Log.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$resource', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Count by status
    const byStatus = await Log.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent activity (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await Log.countDocuments({ 
      ...dateFilter,
      createdAt: { $gte: last24Hours }
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        recentActivity,
        byActionType,
        byUserRole,
        byResource,
        byStatus
      }
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch log stats', error: error.message });
  }
};
