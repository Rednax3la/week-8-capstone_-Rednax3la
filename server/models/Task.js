const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
    maxlength: [200, 'Task title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'completed', 'cancelled'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['bug', 'feature', 'improvement', 'documentation', 'research', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  dueDate: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
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
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    editedAt: Date,
    isEdited: {
      type: Boolean,
      default: false
    }
  }],
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Subtask title cannot be more than 100 characters']
    },
    completed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
  dependencies: [{
    task: {
      type: mongoose.Schema.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked-by', 'related'],
      default: 'related'
    }
  }],
  timeTracking: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    duration: {
      type: Number,
      min: 0
    },
    description: {
      type: String,
      maxlength: [200, 'Time entry description cannot be more than 200 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  position: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') return false;
  return new Date() > this.dueDate;
});

// Virtual for subtask completion percentage
taskSchema.virtual('subtaskProgress').get(function() {
  if (this.subtasks.length === 0) return 100;
  
  const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Virtual for total time tracked
taskSchema.virtual('totalTimeTracked').get(function() {
  return this.timeTracking.reduce((total, entry) => {
    return total + (entry.duration || 0);
  }, 0);
});

// Virtual for comment count
taskSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Pre-save middleware to update completion date
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
      this.progress = 100;
    } else if (this.status !== 'completed') {
      this.completedAt = undefined;
    }
  }
  
  if (this.isModified() && !this.isNew) {
    this.lastActivity = new Date();
  }
  
  next();
});

// Method to check if user can edit task
taskSchema.methods.canEdit = function(userId, userRole) {
  // Task creator can always edit
  if (this.createdBy.toString() === userId.toString()) return true;
  
  // Assigned users can edit
  if (this.assignedTo.includes(userId)) return true;
  
  // Project admins and owners can edit
  if (userRole === 'admin' || userRole === 'owner') return true;
  
  return false;
};

// Method to add comment
taskSchema.methods.addComment = function(userId, text) {
  this.comments.push({
    user: userId,
    text: text
  });
  return this.save();
};

// Method to add time entry
taskSchema.methods.addTimeEntry = function(userId, startTime, endTime, description) {
  const duration = endTime ? (endTime - startTime) / (1000 * 60 * 60) : 0; // hours
  
  this.timeTracking.push({
    user: userId,
    startTime,
    endTime,
    duration,
    description
  });
  
  this.actualHours = (this.actualHours || 0) + duration;
  return this.save();
};

// Static method to find tasks by project
taskSchema.statics.findByProject = function(projectId) {
  return this.find({ 
    project: projectId, 
    isArchived: false 
  })
  .populate('assignedTo', 'name email avatar')
  .populate('createdBy', 'name email avatar')
  .populate('comments.user', 'name avatar')
  .sort({ position: 1, createdAt: -1 });
};

// Static method to find overdue tasks
taskSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' },
    isArchived: false
  });
};

// Indexes for better performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ lastActivity: -1 });
taskSchema.index({ position: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ isArchived: 1 });

module.exports = mongoose.model('Task', taskSchema);
