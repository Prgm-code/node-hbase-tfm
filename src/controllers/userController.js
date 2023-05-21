const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const UserModel = require('../models/userModel');


dotenv.config();


exports.index = (req, res) => {
  UserModel.getAllUsers((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    } else {
      res.json( data );
    }
  });
};

exports.create = (req, res) => {
  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  };
  const userId = `${user.firstName}_${user.lastName}`;

  UserModel.comprobarTabla; // Comprueba si existe la tabla, si no existe la crea

  // Comprueba si existe el usuario por email
  UserModel.getUserByEmail(user.email, (err, data) => {
    if (data) {
      return res.status(400).json({ message: "El Email ya existe" });
    } else {
      // Comprueba si existe el usuario por userId
      UserModel.getUserById(userId, (err, data) => {
        if (data) {
          console.log(data);
          return res.status(400).json({ message: "El usuario ya existe" });
        } else {
          // Comprueba la longitud de la contraseña
          if (user.password.length < 8) {
            return res
              .status(400)
              .json({ message: "La contraseña debe tener al menos 8 caracteres" });
          } else {
            // Crea el usuario
            UserModel.createUser(user, (err, data) => {
              if (err) {
                res.status(500).json({
                  message:
                    err.message || "Some error occurred while creating the user."
                });
              } else {
                res.status(200).json({ data });
              }
            });
          }
        }
      });
    }
  });
};


exports.update = (req, res) => {
  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  };

  UserModel.updateUser(req.params.userId, user, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while updating the user."
      });
    } else {
      res.status(200).json({ data });
    }
  });
};

exports.deletes = (req, res) => {
  UserModel.deleteUser(req.params.userId, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message ||       "Some error occurred while deleting the user."
    });
  } else {
    res.status(200).json({ data });
  }
});
};

exports.login = (req, res) => {
  UserModel.validateUser( req.body.userId, req.body.password  , async (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message 
    });
  } else {
    const token = await jwt.sign(
      { sub: req.body.userId, expiresIn: 60 * 60 *24 },
      process.env.JWT_SECRET);
    console.log(token);
    res.status(200).json(token);
  }

  });
};

exports.getUserByEmail = (req, res) => {
  UserModel.getUserByEmail(req.params.email, (err, data) => {
    if (err) {
      res.status(404).json({
        message: err.message 
    });
  } else {
    res.status(200).json({ data });
  }
});
}

exports.getUserById = (req, res) => {
  UserModel.getUserById(req.params.userId, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message 
    });
  } else {
    res.status(200).json({ data });
  }
});
}

exports.jwtVerify = (req, res, next) => {

  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(401).json({ auth: false, message: 'No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
    }

    req.userId = decoded.sub;
    next();
  });
}



