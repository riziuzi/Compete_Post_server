const mongoose = require("mongoose");

const private_Post = new mongoose.Schema({
  data: {
    type: Object,
    required: true
  },
  createdDate: {
    type: Number,
    default: () => Date.now()
  },
  lastUpdatedDate: {
    type: Number,
    default: () => Date.now()
  },
  userId: {
    type: String,
    required: true
  },
  coUserIds: {
    type: [String],
    required: true
  }
});

const public_Post = new mongoose.Schema({
  data: {
    type: Object,
    required: true
  },
  publishedDate: {
    type: Number,
    default: () => Date.now()
  },
  createdDate: {
    type: Number,
    default: () => Date.now()
  },
  lastUpdatedDate: {
    type: Number,
    default: () => Date.now()
  },
  userId: {
    type: String,
    required: true
  },
  coUserIds: {
    type: [String],
    required: true
  }
});

// Middleware to update lastUpdatedDate before saving
private_Post.pre('save', function (next) {
  this.lastUpdatedDate = new Date().getTime();
  next();
});
public_Post.pre('save', function (next) {
  this.lastUpdatedDate = new Date().getTime();
  next();
});

exports.Private_Post_Model = mongoose.model("Private_Post", private_Post);
exports.Public_Post_Model = mongoose.model("Public_Post", public_Post);
