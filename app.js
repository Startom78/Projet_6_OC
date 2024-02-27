const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config({path: '.env'});
mongoose.connect(`mongodb+srv://${process.env.MONGOOSE_HOST}.mongodb.net/?retryWrites=true&w=majority`)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', true)
  next();
});

app.use(express.urlencoded({extended: true}))
app.use(express.json())

const userRouter = require("./routes/user")
app.use("/api/auth", userRouter)

const sauceRouter = require("./routes/sauce")
app.use("/api/sauces", sauceRouter)

const path = require('path')
app.use('/images', express.static(path.join(__dirname,'images')))


module.exports = app;