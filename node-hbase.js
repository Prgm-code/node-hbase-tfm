const HBase = require("hbase");
const client = HBase({ host: "192.168.88.65", port: 1980 });
const tableName = 'my_table';
const columnFamily = 'cf1';

client
  .createTable(tableName, [{ name: columnFamily }])
  .then(() => console.log('Table created'))
  .catch((err) => console.error('Error creating table:', err));
const rowKey = 'row1';
const column = `${columnFamily}:col1`;
const value = 'Hello, HBase!';

client
  .table(tableName)
  .row(rowKey)
  .put(column, value)
  .then(() => console.log('Data inserted'))
  .catch((err) => console.error('Error inserting data:', err));

client
.table(tableName)
.row(rowKey)
.get(column)
.then((data) => console.log('Data read:', data[0].$))
.catch((err) => console.error('Error reading data:', err));

client
  .table(tableName)
  .row(rowKey)
  .delete(column)
  .then(() => console.log('Data deleted'))
  .catch((err) => console.error('Error deleting data:', err));
