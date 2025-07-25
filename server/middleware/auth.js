const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorResponse('The user belonging to this token no longer exists', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new ErrorResponse('User account has been deactivated', 401));
    }

    // Update last active
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user owns resource or has admin role
const ownerOrAdmin = (Model, resourceField = 'user') => {
  return asyncHandler(async (req, res, next) => {
    const resource = await Model.findById(req.params.id);

    if (!resource) {
      return next(new ErrorResponse('Resource not found', 404));
    }

    // Check if user owns the resource or is admin
    if (
      resource[resourceField].toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse('Not authorized to access this resource', 403)
      );
    }

    req.resource = resource;
    next();
  });
};

// Check project membership
const checkProjectMembership = asyncHandler(async (req, res, next) => {
  const Project = require('../models/Project');
  const projectId = req.params.projectId || req.body.project;

  if (!projectId) {
    return next(new ErrorResponse('Project ID is required', 400));
  }

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }

  // Check if user is a member of the project
  const isMember = project.members.some(
    member => member.user.toString() === req.user.id
  );

  if (!isMember && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this project', 403));
  }

  req.project = project;
  next();
});

// Check project permissions
const checkProjectPermission = (permission) => {
  return asyncHandler(async (req, res, next) => {
    const project = req.project;

    if (!project) {
      return next(new ErrorResponse('Project not found in request', 500));
    }

    // Admin always has permission
    if (req.user.role === 'admin') {
      return next();
    }

    // Check user's role and permissions in the project
    const member = project.members.find(
      member => member.user.toString() === req.user.id
    );

    if (!member) {
      return next(new ErrorResponse('Not a member of this project', 403));
    }

    // Owner and admin roles have all permissions
    if (member.role === 'owner' || member.role === 'admin') {
      return next();
    }

    // Check specific permission
    if (!member.permissions[permission]) {
      return next(
        new ErrorResponse(`Permission denied: ${permission}`, 403)
      );
    }

    next();
  });
};

// Optional authentication - doesn't fail if no token
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but that's okay for optional auth
      console.log('Invalid token in optional auth:', error.message);
    }
  }

  next();
});

module.exports = {
  protect,
  authorize,
  ownerOrAdmin,
  checkProjectMembership,
  checkProjectPermission,
  optionalAuth
};
