const UserModel = require('../models/userModel');



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

  console.log(user)
  UserModel.comprobarTabla;
  UserModel.createUser(user, (err, data) => {
    if (err) {
      console.log(user)
      res.status(500).send({
        message: err.message || "Some error occurred while creating the user."
      });
    } else {
      console.log(data)
      res.status(200).json({ data });
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

exports.delete = (req, res) => {
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

