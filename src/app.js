const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/configRoutes");
const cors = require("cors");
const morgan = require("morgan");
const path = require('path');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use("/api", userRoutes);

// Sirve los archivos estáticos desde el directorio dist
app.use(express.static(path.join(__dirname, "dist")));

// Enruta todas las solicitudes a index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: err.toString() });
}

app.use(errorHandler);

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
