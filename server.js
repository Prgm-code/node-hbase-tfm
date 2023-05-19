const hbase = require('hbase')
const assert = require('assert')

// Instantiate a new client
const client = hbase({ host: '192.168.0.58', port: 1980 })


const res = client.tables(async (error, tables) => {
  console.log(tables)
  await describeTables(tables)


})

function describeTables(tables) {
  tables.forEach(table => {
    
    client.table(table.name).exists((error, exists) => {
      if (exists) {
        console.log('Table exists' , table.name)
        client.table(table.name).scan((error, rows) => {
          console.log(rows)
        })
      } else {
        console.log('Table does not exist')
      }
    })
  })
}



/* client.version((error, version) => {
  console.info(version)
})

client.version_cluster(function (error, version) {
  console.info(version)
})

client.status_cluster(function (error, statusCluster) {
  console.info(statusCluster)
}) */
/* 
client.tables((error, tables) => {
  console.info(tables)
})

// Use the client instance to create a new table
const myNewTable = client.table('my_new_table')
myNewTable.create('my_new_column', function (error, success) {
  
  console.info('Table created: ' + (success ? 'yes' : 'no'))
})

client.table('my_new_table2')
  .create({
  IS_META: false,
  IS_ROOT: false,
  COLUMNS: [{
    NAME: 'my_new_column'
  }]
}, (error, success) => {
  console.info('Table created: ' + (success ? 'yes' : 'no'))
})

//delete table
client.table('tabla')
  .delete((error, success) => {
 if (success) console.info('Table deleted');
else console.error(error)

  }) */
