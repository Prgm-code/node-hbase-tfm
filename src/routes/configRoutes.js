const express = require('express');
const router = express.Router();
const { index, create, getUserByEmail, deletes, getUserById, jwtVerify, login, update } = require('../controllers/userController');
const hdfsController = require('../controllers/hdfsControllers');
const multer = require('multer');
const upload = multer();

router.get('/users',jwtVerify , index);
router.post('/register', create);
router.post('/login', login);
router.get('/user/:userId',jwtVerify, getUserById);
router.get('/email/:email',jwtVerify, getUserByEmail);

router.patch('/user/:userId',jwtVerify, update);
router.delete('/user/:userId',jwtVerify, deletes);

//hdfs routes

router.post('/hdfs/upload',jwtVerify, upload.single('file'), hdfsController.upload);
router.get('/hdfs/read/:path',jwtVerify, hdfsController.read);
router.get('/hdfs/list/',jwtVerify, hdfsController.list);
router.delete('/hdfs/remove/:path',jwtVerify, hdfsController.remove);


module.exports = router;
