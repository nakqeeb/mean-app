const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    // required: true
    default: 'This is a default value',
  },
  imagePath: {
    type: String,
    required: true
  },
  creator: { // lecture 115
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Post', postSchema); // 'Post' sould start with upper case
 // since our model name is 'Post', then our collection name will be (posts)
