const express = require('express');

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');

const PostController = require('../controllers/posts');
const router = express.Router();



router.post('', checkAuth, extractFile, PostController.creatPost);

router.get('', PostController.getPosts);

router.get('/:postId', PostController.getPost);

router.put('/:postId', checkAuth, extractFile, PostController.updatePost);

router.delete('/:postId', checkAuth, PostController.deletePost);


module.exports = router;
