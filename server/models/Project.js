const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true,
    maxlength: [100, 'Project name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    permissions: {
      canEditProject: {
        type: Boolean,
        default: false
      },
      canDeleteTasks: {
        type: Boolean,
        default: false
      },
      canInviteMembers: {
        type: Boolean,
        default: false
      },
      canManageMembers: {
        type: Boolean,
        default: false
      }
    }
  }],
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  budget: {
    allocated: {
      type: Number,
      min: 0
    },
    spent: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  color: {
    type: String,
    default: '#3B82F6',
    match: /^#[0-9A-F]{6}$/i
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    allowFileUploads: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    notifications: {
      taskCreated: {
        type: Boolean,
        default: true
      },
      taskCompleted: {
        type: Boolean,
        default: true
      },
      memberJoined: {
        type: Boolean,
        default: true
      }
    }
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    public_id: String,
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for project tasks
projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project'
});

// Virtual for progress calculation
projectSchema.virtual('progress').get(function() {
  if (!this.tasks || this.tasks.length === 0) return 0;
  
  const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
  return Math.round((completedTasks / this.tasks.length) * 100);
});

// Virtual for member count
projectSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for task count
projectSchema.virtual('taskCount').get(function() {
  return this.tasks ? this.tasks.length : 0;
});

// Pre-save middleware to update lastActivity
projectSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastActivity = new Date();
  }
  next();
});

// Method to check if user is member
projectSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString()
  );
};

// Method to get user role in project
projectSchema.methods.getUserRole = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

// Method to check user permissions
projectSchema.methods.hasPermission = function(userId, permission) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!member) return false;
  
  // Owner and admin have all permissions
  if (member.role === 'owner' || member.role === 'admin') return true;
  
  return member.permissions[permission] || false;
};

// Static method to find projects by user
projectSchema.statics.findByUser = function(userId) {
  return this.find({
    'members.user': userId,
    isArchived: false
  }).populate('members.user', 'name email avatar')
    .populate('owner', 'name email avatar')
    .sort({ lastActivity: -1 });
};

// Indexes for better performance
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ lastActivity: -1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ isArchived: 1 });

module.exports = mongoose.model('Project', projectSchema);
