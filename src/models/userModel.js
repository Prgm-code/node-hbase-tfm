const HBase = require("hbase");
const bcrypt = require("bcrypt");

const client = new HBase({ host: "192.168.88.65", port: 1980 });

const TABLE_NAME = "users";
const FAMILY_NAME = "user_info";

//comprobar que la tabla existe
exports.comprobarTabla = client.table(TABLE_NAME).exists((err, exists) => {
  if (exists) {
    console.log(`Table ${TABLE_NAME} exists`);
  } else {
    //crear la tabla
    client.table(TABLE_NAME).create(FAMILY_NAME, (err, success) => {
      if (success) {
        console.log(`Table ${TABLE_NAME} created`);
      }
    });
  }
});

exports.getAllUsers = (result) => {
  client.table(TABLE_NAME).scan((err, rows) => {
    if (err) {
      result(err, null);
      return;
    }
    console.log(rows);
    const users = [];
    const userMap = {};

    rows.forEach((row) => {
      if (!userMap[row.key]) {
        const modifiedTimestamp = new Date(row.timestamp).toLocaleString();
        userMap[row.key] = {
          id: row.key,
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          timestamp: modifiedTimestamp,
        };
      }

      if (row.column === "user_info:firstName") {
        userMap[row.key].firstName = row.$;
      } else if (row.column === "user_info:lastName") {
        userMap[row.key].lastName = row.$;
      } else if (row.column === "user_info:email") {
        userMap[row.key].email = row.$;
      } else if (row.column === "user_info:password") {
        userMap[row.key].password = row.$;
      }
    });

    for (const key in userMap) {
      users.push(userMap[key]);
    }

    result(null, users);
  });
};

exports.createUser = async (user, result) => {
  const rowKey = `${user.firstName}_${user.lastName}`;
  console.log(rowKey);
  // Encriptar la contraseña
  const salt = await bcrypt.genSalt(10);
  bcrypt.hash(user.password, salt, function (err, hash) {
    // Si hay un error, devolver el error
    if (err) {
      return result(err);
    }

    const data = [
      {
        column: `${FAMILY_NAME}:firstName`,
        timestamp: Date.now(),
        $: user.firstName,
      },
      {
        column: `${FAMILY_NAME}:lastName`,
        timestamp: Date.now(),
        $: user.lastName,
      },
      { column: `${FAMILY_NAME}:email`, timestamp: Date.now(), $: user.email },
      {
        column: `${FAMILY_NAME}:password`,
        timestamp: Date.now(),
        $: hash,
      },
    ];

    client
      .table(TABLE_NAME)
      .row(rowKey)
      .put(data, (err, success) => {
        if (err) {
          result(err, null);
          return;
        }

        result(null, { id: rowKey }); //devolver el id del usuario creado
      });
  });
};

exports.updateUser = async (userId, user, result) => {
  // Hashear la contraseña antes de almacenarla
  const salt = await bcrypt.genSalt(10);
  bcrypt.hash(user.password, salt, (err, hashedPassword) => {
    if (err) {
      result(err, null);
      return;
    }
    const data = [
      {
        column: `${FAMILY_NAME}:firstName`,
        timestamp: Date.now(),
        $: user.firstName,
      },
      {
        column: `${FAMILY_NAME}:lastName`,
        timestamp: Date.now(),
        $: user.lastName,
      },
      { column: `${FAMILY_NAME}:email`, timestamp: Date.now(), $: user.email },
      {
        column: `${FAMILY_NAME}:password`,
        timestamp: Date.now(),
        $: hashedPassword, // Guardar la contraseña hasheada
      },
    ];

    try {client
      .table(TABLE_NAME)
      .row(userId)
      .put(data, (err, success) => {
        if (err) {
          result(err, null);

          return;
        }

        result(null, { id: userId }); //devolver el id del usuario actualizado
      });
    } catch (err) {
      result(err, null);
    }
  });
};

exports.deleteUser = (userId, result) => {
  client
    .table(TABLE_NAME)
    .row(userId)
    .delete((err, success) => {
      if (err) {
        result(err, null);
        return;
      }

      result(null, { id: userId }); //devolver el id del usuario eliminado
    });
};

exports.getUserById = (userId, result) => {
  client
    .table(TABLE_NAME)
    .row(userId)
    .get((err, row) => {
      if (err) {
        result(err, null);
        return;
      }

      if (!row) {
        result({ kind: "not_found" }, null);
        return;
      }

      const user = {
        id: row.key,
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      };

      row.forEach((cell) => {
        if (cell.column === "user_info:firstName") {
          user.firstName = cell.$;
        } else if (cell.column === "user_info:lastName") {
          user.lastName = cell.$;
        } else if (cell.column === "user_info:email") {
          user.email = cell.$;
        } else if (cell.column === "user_info:password") {
          user.password = cell.$;
        }
      });

      result(null, user);
    });
};

exports.getUserByEmail = (email, result) => {
  console.log(email);
  let family = "user_info";
  let qualifier = "email";

  let encodedFamily = Buffer.from(family).toString("base64");
  let encodedQualifier = Buffer.from(qualifier).toString("base64");

  try {
    const scanner = client
      .table(TABLE_NAME)
      .scan({
        filter: {
          op: "EQUAL",
          type: "SingleColumnValueFilter",
          family: encodedFamily,
          qualifier: encodedQualifier,
          comparator: { value: email, type: "BinaryComparator" },
        },
      })
      .on("readable", () => {
        const row = scanner.read();
        if (row) {
          console.log("row/n", row);

          if (row.column === "user_info:email") result(null, row.key);
        } else {
          console.log("No more rows");
          result({ kind: "not_found" }, null);
        }
      })

      .on("error", (err) => {
        console.log("error/n", err);
        result(err, null);
      });
  } catch (error) {
    console.log(error);
    result(error, null);
  }
};

exports.validateUser = (rowKey, password, result) => {
  // Buscar el usuario por rowKey
  try {
    client
      .table(TABLE_NAME)
      .row(rowKey)
      .get((err, cells) => {
        if (err) {
          result(err, null);
          return;
        }

        // Si no se encontró el usuario
        if (!cells || cells.length === 0) {
          result(new Error("User not found"), null);
          return;
        }

        // Encontrar la celda que contiene la contraseña
        const passwordCell = cells.find(
          (cell) => cell.column === `${FAMILY_NAME}:password`
        );

        // Si no se encontró la celda de la contraseña
        if (!passwordCell) {
          result(new Error("Password not found"), null);
          return;
        }

        // Comparar la contraseña proporcionada con la contraseña almacenada
        bcrypt.compare(password, passwordCell.$, (err, isMatch) => {
          if (err) {
            result(err, null);
            return;
          }

          if (isMatch) {
            // Si las contraseñas coinciden, devolver el usuario
            result(null, cells);
          } else {
            // Si las contraseñas no coinciden, devolver un error
            result(new Error("Invalid password"), null);
          }
        });
      });
  } catch (error) {
    console.log(error);
    result(error, null);
  }
};
