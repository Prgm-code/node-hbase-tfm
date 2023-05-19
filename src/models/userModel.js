const HBase = require('hbase');
const client = new HBase({ host: '192.168.88.65', port: 1980 });

const TABLE_NAME = 'users';
const FAMILY_NAME = 'user_info';

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
      return ;
    }
      console.log(rows)
      const users = [];
      const userMap = {};
      
      rows.forEach((row) => {
        if (!userMap[row.key]) {
          userMap[row.key] = {
            id: row.key,
            firstName: '',
            lastName: '',
            email: '',
            password: ''
          };
        }
      
        if (row.column === 'user_info:firstName') {
          userMap[row.key].firstName = row.$;
        } else if (row.column === 'user_info:lastName') {
          userMap[row.key].lastName = row.$;
        } else if (row.column === 'user_info:email') {
          userMap[row.key].email = row.$;
        } else if (row.column === 'user_info:password') {
          userMap[row.key].password = row.$;
        }
      });
      
      for (const key in userMap) {
        users.push(userMap[key]);
      }

    result(null, (users));
  });
};

exports.createUser = (user, result) => {
  const rowKey = `${user.firstName}_${user.lastName}`;
  console.log(rowKey);

  const data = [
    { column: `${FAMILY_NAME}:firstName`, timestamp: Date.now(), $: user.firstName },
    { column: `${FAMILY_NAME}:lastName`, timestamp: Date.now(), $: user.lastName },
    { column: `${FAMILY_NAME}:email`, timestamp: Date.now(), $: user.email },
    { column: `${FAMILY_NAME}:password`, timestamp: Date.now(), $: user.password }
  ];

  client.table(TABLE_NAME).row(rowKey).put(data, (err, success) => {
    if (err) {
      result(err, null);
      return;
    }

    result(null, { id: rowKey });
  });
};

exports.updateUser = (userId, user, result) => {
  const data =[
    { column: `${FAMILY_NAME}:firstName`, timestamp: Date.now(), $: user.firstName },
    { column: `${FAMILY_NAME}:lastName`, timestamp: Date.now(), $: user.lastName },
    { column: `${FAMILY_NAME}:email`, timestamp: Date.now(), $: user.email },
    { column: `${FAMILY_NAME}:password`, timestamp: Date.now(), $: user.password }
  ];

  client.table(TABLE_NAME).row(userId).put(data, (err, success) => {
    if (err) {
      result(err, null);
     
      return 
    }

    result(null, { id: userId });
    console.log(success);
  });
};

exports.deleteUser = (userId, result) => {
  client.table(TABLE_NAME).row(userId).delete((err, success) => {
    if (err) {
      result(err, null);
      return;
    }

    result(null, { id: userId });
  });
};
