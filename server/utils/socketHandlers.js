const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandlers = (socket, io) => {
  // Authenticate socket connection
  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user && user.isActive) {
        socket.userId = user._id.toString();
        socket.user = user;
        socket.emit('authenticated', { success: true, user: user });
        console.log(`User authenticated: ${user.name} (${socket.id})`);
      } else {
        socket.emit('authentication_error', { message: 'Invalid user' });
      }
    } catch (error) {
      socket.emit('authentication_error', { message: 'Invalid token' });
    }
  });

  // Join project room
  socket.on('join_project', (projectId) => {
    if (socket.userId) {
      socket.join(`project_${projectId}`);
      socket.currentProject = projectId;
      console.log(`User ${socket.userId} joined project ${projectId}`);
      
      // Notify other members
      socket.to(`project_${projectId}`).emit('user_joined_project', {
        userId: socket.userId,
        user: socket.user,
        timestamp: new Date()
      });
    }
  });

  // Leave project room
  socket.on('leave_project', (projectId) => {
    if (socket.userId) {
      socket.leave(`project_${projectId}`);
      console.log(`User ${socket.userId} left project ${projectId}`);
      
      // Notify other members
      socket.to(`project_${projectId}`).emit('user_left_project', {
        userId: socket.userId,
        user: socket.user,
        timestamp: new Date()
      });
    }
  });

  // Handle task updates
  socket.on('task_updated', (data) => {
    if (socket.userId && socket.currentProject) {
      socket.to(`project_${socket.currentProject}`).emit('task_updated', {
        ...data,
        updatedBy: socket.user,
        timestamp: new Date()
      });
    }
  });

  // Handle task creation
  socket.on('task_created', (data) => {
    if (socket.userId && socket.currentProject) {
      socket.to(`project_${socket.currentProject}`).emit('task_created', {
        ...data,
        createdBy: socket.user,
        timestamp: new Date()
      });
    }
  });

  // Handle task deletion
  socket.on('task_deleted', (data) => {
    if (socket.userId && socket.currentProject) {
      socket.to(`project_${socket.currentProject}`).emit('task_deleted', {
        ...data,
        deletedBy: socket.user,
        timestamp: new Date()
      });
    }
  });

  // Handle comments
  socket.on('comment_added', (data) => {
    if (socket.userId && socket.currentProject) {
      socket.to(`project_${socket.currentProject}`).emit('comment_added', {
        ...data,
        user: socket.user,
        timestamp: new Date()
      });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    if (socket.userId && socket.currentProject) {
      socket.to(`project_${socket.currentProject}`).emit('user_typing', {
        userId: socket.userId,
        user: socket.user,
        taskId: data.taskId,
        timestamp: new Date()
      });
    }
  });

  socket.on('typing_stop', (data) => {
    if (socket.userId && socket.currentProject) {
      socket.to(`project_${socket.currentProject}`).emit('user_stopped_typing', {
        userId: socket.userId,
        taskId: data.taskId,
        timestamp: new Date()
      });
    }
  });

  // Handle project updates
  socket.on('project_updated', (data) => {
    if (socket.userId && socket.currentProject) {
      socket.to(`project_${socket.currentProject}`).emit('project_updated', {
        ...data,
        updatedBy: socket.user,
        timestamp: new Date()
      });
    }
  });

  // Handle member invitations
  socket.on('member_invited', (data) => {
    if (socket.userId && socket.currentProject) {
      socket.to(`project_${socket.currentProject}`).emit('member_invited', {
        ...data,
        invitedBy: socket.user,
        timestamp: new Date()
      });
      
      // Send notification to invited user if they're online
      const invitedUserSockets = Array.from(io.sockets.sockets.values())
        .filter(s => s.userId === data.invitedUserId);
      
      invitedUserSockets.forEach(s => {
        s.emit('invitation_received', {
          ...data,
          invitedBy: socket.user,
          timestamp: new Date()
        });
      });
    }
  });

  // Handle notifications
  socket.on('send_notification', (data) => {
    if (socket.userId) {
      const targetUserSockets = Array.from(io.sockets.sockets.values())
        .filter(s => s.userId === data.targetUserId);
      
      targetUserSockets.forEach(s => {
        s.emit('notification', {
          ...data,
          from: socket.user,
          timestamp: new Date()
        });
      });
    }
  });

  // Handle user status updates
  socket.on('status_update', (status) => {
    if (socket.userId && socket.currentProject) {
      socket.to(`project_${socket.currentProject}`).emit('user_status_updated', {
        userId: socket.userId,
        status: status,
        timestamp: new Date()
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId && socket.currentProject) {
      socket.to(`project_${socket.currentProject}`).emit('user_disconnected', {
        userId: socket.userId,
        user: socket.user,
        timestamp: new Date()
      });
    }
    console.log(`User disconnected: ${socket.id}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    socket.emit('error', { message: 'An error occurred' });
  });
};

module.exports = socketHandlers;
