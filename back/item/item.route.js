const express = require('express');
var multer  = require('multer')

const router = express.Router();
const upload = multer();

const itemController = require('./item.controller');

router.get('/', itemController.list);
router.post('/', upload.single('image'), itemController.create);
router.put('/move/', itemController.move);
router.get('/:id/', itemController.read);
router.put('/:id/', itemController.update);
router.delete('/:id/', itemController.delete);

module.exports = router;
