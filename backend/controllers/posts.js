const Post = require('../models/post');

exports.creatPost =  (req, res, next) => { // single('image') image name shuld be identical with the name in the frontend (lecture 80)
  const url = req.protocol + "://" + req.get("host"); // lecture 81
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId // userData is declared at check-auth.js file which hold the value that we have stored in the token (email and userId). lecture 116
    });
    post.save().then(createdPost => {
      res.status(201).json({
        message: "Post added successfully",
        post: {
          ...createdPost,
          id: createdPost._id
        }
      });
    }).catch(error => {
      res.status(500).json({
        message: 'Creating a post failed!'
      });
    });
}

exports.getPosts = (req, res, next) => {
  // console.log(req.query);
  // guery.pagesize & guery.page (pagesize & page) this it could be any name but important that it should match the name used as a query in the link Ex: (http://localhost:3000/api/posts?pagesize=2&page=2) for more info go to lecture 89
  const pageSize = +req.query.pagesize; // by default the extracting value from the query parameters will always treated as a string.
  const currentPage = +req.query.page; // So we added (+) infront each of them to convert string to a number
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) { // lecture 89
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
    .then(posts => {
      fetchedPosts = posts;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched successfully!',
        posts: fetchedPosts,
        totalPosts: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching posts failed!'
      });
    });
}

exports.getPost = (req, res, next) => {
  Post.findById(req.params.postId).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({
        message: 'Post not found!'
      });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Fetching post failed!'
    })
  });
}

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath; // lecture 84
    if (req.file) { // lecture 84
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename
    }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId // lecture 119
  });
  Post.updateOne({ _id: req.params.postId, creator: req.userData.userId }, post).then(result => {
    // console.log(result);
    if (result.matchedCount > 0) {
      res.status(200).json({ message: 'Updated successfully!' });
    } else {
      res.status(401).json({ message: 'Not Authorized!' });
    }
  }).catch(error => {
    res.status(500).json({
      message: 'Could not update post!'
    });
  });;
}

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.deleteOne({ _id: postId, creator: req.userData.userId }).then(result => {
    // console.log(result);
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Deletion successful!' });
    } else {
      res.status(401).json({ message: 'Not Authorized!' });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Deleting post failed!'
    })
  });;
}
