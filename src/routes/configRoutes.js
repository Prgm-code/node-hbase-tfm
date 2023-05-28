const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
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
router.put('/hdfs/mkdir/:path',jwtVerify, hdfsController.mkdir);

// Ruta de proxy para JupyterHub
router.use('/jupyter', createProxyMiddleware({
    target: 'http://master:9909/', // URL JupyterHub
    changeOrigin: true,
    followRedirects: true, //  opción para que funcione el redireccionamiento
    pathRewrite: {
        '^/jupyter': '', // rjupyter en las rutas
    },
}));

router.use('/jupyter/static', createProxyMiddleware({
    target: 'http://master:9909/', 
    changeOrigin: true,
    pathRewrite: {
        '^/jupyter/static': '/hub/static', // ajusta el prefijo de la ruta a la ruta de los archivos estáticos en JupyterHub
    },
}));


module.exports = router;
