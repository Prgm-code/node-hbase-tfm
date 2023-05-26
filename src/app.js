const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/configRoutes');
const cors = require('cors');
const morgan = require('morgan');



const app = express();
app.use(cors());
app.use(morgan('dev'));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(express.json());

app.use('/', userRoutes);

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: err.toString() });
}

app.use(errorHandler);

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);

});
