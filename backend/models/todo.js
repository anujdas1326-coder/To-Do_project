const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    owner: {
      type: String, 
      required: true,
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Get all todos for a user
todoSchema.statics.getTodosByOwner = async function (ownerEmail) {
  return this.find({ owner: ownerEmail }).sort({ createdAt: -1 });
};

// Create a todo
todoSchema.statics.createTodo = async function (
  ownerEmail,
  title,
  description
) {
  if (!title) {
    throw Error('Title is required');
  }

  return this.create({
    owner: ownerEmail,
    title,
    description,
  });
};

module.exports = mongoose.model('Todo', todoSchema);