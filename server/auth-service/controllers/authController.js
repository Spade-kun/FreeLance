import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import axios from 'axios';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';

// User service URL
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:1003';

// Generate JWT tokens
const generateAccessToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );
};

// @desc    Register user (Internal use by User Service)
// @route   POST /api/auth/register
// @access  Public (should be protected by API Gateway in production)
export const register = async (req, res) => {
  try {
    const { email, password, role, userId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      role,
      userId,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.userId, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.userId,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const user = await User.findOne({ 'refreshTokens.token': refreshToken });
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user with this refresh token
    const user = await User.findOne({
      _id: decoded.userId,
      'refreshTokens.token': refreshToken
    });

    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user.userId, user.email, user.role);

    res.status(200).json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// @desc    Verify token
// @route   POST /api/auth/verify-token
// @access  Private
export const verifyToken = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.authId).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    user.refreshTokens = []; // Invalidate all refresh tokens
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({
        success: true,
        message: 'If an account exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });

      res.status(200).json({
        success: true,
        message: 'Password reset link sent to email'
      });
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return res.status(500).json({ message: 'Error sending email' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Hash token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Invalidate all refresh tokens
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error while resetting password' });
  }
};

// Helper function to find user role by searching across all user types
const findUserRoleByEmail = async (email) => {
  try {
    // Search in admins
    const adminResponse = await axios.get(`${USER_SERVICE_URL}/api/users/admins`, {
      params: { email }
    }).catch(() => null);

    if (adminResponse && adminResponse.data.success) {
      const admin = adminResponse.data.data.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (admin) {
        return { role: 'admin', userId: admin._id, userData: admin };
      }
    }

    // Search in instructors
    const instructorResponse = await axios.get(`${USER_SERVICE_URL}/api/users/instructors`, {
      params: { email }
    }).catch(() => null);

    if (instructorResponse && instructorResponse.data.success) {
      const instructor = instructorResponse.data.data.find(i => i.email.toLowerCase() === email.toLowerCase());
      if (instructor) {
        return { role: 'instructor', userId: instructor._id, userData: instructor };
      }
    }

    // Search in students
    const studentResponse = await axios.get(`${USER_SERVICE_URL}/api/users/students`, {
      params: { email }
    }).catch(() => null);

    if (studentResponse && studentResponse.data.success) {
      const student = studentResponse.data.data.find(s => s.email.toLowerCase() === email.toLowerCase());
      if (student) {
        return { role: 'student', userId: student._id, userData: student };
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding user role:', error);
    return null;
  }
};

// @desc    Google OAuth callback handler
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      // Redirect to frontend with error
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    // Check if this is a new user (needs to complete registration)
    if (user.isNewUser) {
      // Search for existing user in Admin, Instructor, or Student collections
      console.log(`🔍 Searching for existing user with email: ${user.email}`);
      const userRoleInfo = await findUserRoleByEmail(user.email);

      if (userRoleInfo) {
        // User exists in one of the collections!
        console.log(`✅ Found existing ${userRoleInfo.role} with email: ${user.email}`);
        
        // Check if auth record already exists
        let authUser = await User.findOne({ email: user.email });
        
        if (!authUser) {
          // Create auth record for existing user
          console.log(`📝 Creating auth record for existing ${userRoleInfo.role}`);
          authUser = await User.create({
            email: user.email,
            googleId: user.googleId,
            role: userRoleInfo.role,
            userId: userRoleInfo.userId,
            isActive: true,
            password: crypto.randomBytes(32).toString('hex') // Random password for Google users
          });
        } else {
          // Update Google ID if not set
          if (!authUser.googleId) {
            authUser.googleId = user.googleId;
            await authUser.save();
          }
        }

        // Generate tokens
        const accessToken = generateAccessToken(authUser.userId, authUser.email, authUser.role);
        const refreshToken = generateRefreshToken(authUser._id);

        // Save refresh token
        authUser.refreshTokens.push({ token: refreshToken });
        authUser.lastLogin = Date.now();
        await authUser.save();

        // Redirect to appropriate dashboard based on role
        const params = new URLSearchParams({
          accessToken,
          refreshToken,
          role: authUser.role,
          email: authUser.email,
          userId: authUser.userId
        });

        console.log(`🎯 Redirecting ${authUser.role} to dashboard`);
        return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params.toString()}`);
      }

      // User not found in any collection - show error
      console.log(`❌ User not found in any collection: ${user.email}`);
      return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=user_not_found`);
    }

    // Existing auth user - generate tokens
    const accessToken = generateAccessToken(user.userId, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = Date.now();
    await user.save();

    // Redirect to frontend with tokens
    const params = new URLSearchParams({
      accessToken,
      refreshToken,
      role: user.role,
      email: user.email,
      userId: user.userId
    });

    console.log(`🎯 Existing user: Redirecting ${user.role} to dashboard`);
    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params.toString()}`);

  } catch (error) {
    console.error('Google callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};

// @desc    Complete Google OAuth registration (for new users)
// @route   POST /api/auth/google/complete
// @access  Public
export const completeGoogleRegistration = async (req, res) => {
  try {
    const { email, googleId, role, userId } = req.body;

    // Verify this is a new user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with Google OAuth
    const user = await User.create({
      email,
      googleId,
      role,
      userId,
      isActive: true,
      password: crypto.randomBytes(32).toString('hex') // Random password for Google users
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.userId, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = Date.now();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.userId,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Complete Google registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};
