const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/', userController.index); //cheked
router.post('/', userController.create);//cheked
router.put('/:userId', userController.update);
router.delete('/:userId', userController.delete);

module.exports = router;
