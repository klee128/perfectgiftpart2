const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const OpenApiValidator = require('express-openapi-validator');
const gift = require('./gift');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// Used for letting the frontend communicate with the server
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true,
}));
//Used for cookie session
app.use(cookieParser());
app.use(bodyParser.urlencoded( {extended: true}));
app.use(session({
  key : "userId",
  secret: "hello",
  resave: false,
  saveUninitialized: false,
  cookie : {
    expires : 60 * 60 * 24
  }
}))

//Json stuff. Not too sure
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const apiSpec = path.join(__dirname, '../api/openapi.yaml');

const apidoc = yaml.safeLoad(fs.readFileSync(apiSpec, 'utf8'));
app.use('/v0/api-docs', swaggerUi.serve, swaggerUi.setup(apidoc));

app.use(
  OpenApiValidator.middleware({
    apiSpec: apiSpec,
    validateRequests: true,
    validateResponses: true,
  }),
);

app.get('/v0/giftuser', gift.getUsers);

app.post('/v0/postuser', gift.postUser);

app.get('/v0/getqresponse', gift.getQResponse); //openapi.yaml --> app.js --> gift.js --> db.js

// Saves user responses from interest questionnaire on Create Account page.
app.post('/v0/postqresponse', gift.postQResponse);  // might need to somehow combine this with posting a giftuser sicne they're both from Create Account page

// This authenticates and authorizes a user to be able to log in.
app.post('/v0/authenticate', gift.login);

//This check if the user has the authorization to be on the website
app.get('/v0/authenticate', gift.checkLogin)

// Logs out a user
app.get('/v0/logout', gift.logout)

app.use((err, req, res, next) => {
  res.status(err.status).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  });
});

module.exports = app;
