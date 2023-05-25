const express = require('express');
const router = express.Router();
const { index, create, getUserByEmail, deletes, getUserById, jwtVerify, login, update } = require('../controllers/userController');
const {read, write, remove,list} = require('../controllers/hdfsControllers');

router.get('/users',jwtVerify , index);
router.post('/register', create);
router.post('/login', login);
router.get('/user/:userId',jwtVerify, getUserById);
router.get('/email/:email',jwtVerify, getUserByEmail);



router.patch('/user/:userId',jwtVerify, update);
router.delete('/user/:userId',jwtVerify, deletes);

//hdfs routes

router.get('/hdfs',jwtVerify,list);
router.post('/hdfs',jwtVerify,write);



module.exports = router;
