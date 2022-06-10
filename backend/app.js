const path = require('path');
const express = require('express');
const bodyParser = require("body-parser");
const mongooose = require('mongoose');

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

mongooose.connect('mongodb+srv://nakqeeb:' + process.env.MONGO_ATLAS_PW + '@cluster0.rbc72.mongodb.net/node-angular')
.then(() => {
    console.log('Connected to databse');
})
.catch((err) => console.log('Connection is faild'));;

// app.use(express.json()); // if you want to use this, no need to install bodyParser package
// OR
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images"))); // This will make sure that requests going to '/images' are actually forwarded to the folder 'backend/images'. lecture 83

// This code from 'CORS' lecture. (lecture number 40)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"  // 'Authorization' header is added in lecture 105. It should match with the header name that is been set in auth.interceptor.ts file. So if you do not add it, it will cause a CORS origion error
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
