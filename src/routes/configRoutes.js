const express = require('express');
const router = express.Router();
const { index, create, getUserByEmail, deletes, getUserById, jwtVerify, login, update } = require('../controllers/userController');


router.get('/users',jwtVerify, index); //cheked
router.post('/register', create);//cheked
router.post('/login', login);
router.get('/user/:userId',jwtVerify, getUserById);
router.get('/email/:email',jwtVerify, getUserByEmail);



router.patch('/user/:userId',jwtVerify, update);
router.delete('/user/:userId',jwtVerify, deletes);

module.exports = router;
