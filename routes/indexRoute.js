const express = require('express');

const router = express.Router();

const addNodePostController = require('../controllers/add-node/post');
const settleZKPPostController = require('../controllers/settle-zkp/post');

router.post(
  '/add-node',
    addNodePostController
);
router.post(
  '/settle-zkp',
    settleZKPPostController
);

module.exports = router;
