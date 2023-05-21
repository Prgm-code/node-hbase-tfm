const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/configRoutes');


const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(express.json());

app.use('/', userRoutes);

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);

});
