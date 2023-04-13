'use strict';

// 3rd Party Resources
require('dotenv').config();
const express = require('express');
const cors = require('cors');


// Esoteric Resources
const errorHandler = require('./error-handlers/500.js');
const notFound = require('./error-handlers/404.js');

const v1 = require('./routes/v1');
const v2 = require('./routes/v2');
const logger = require('./auth/middleware/logger');
const bearerAuth = require('./auth/middleware/bearer');
const account = require('./auth/routes');

// Prepare the express app
const app = express();

const PORT = process.env.PORT || 3002;

// App Level MW
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', logger, account);
app.use('/api/v1', v1);
app.use('/api/v2', bearerAuth, v2);

// Catchalls
app.use('*', notFound);
app.use(errorHandler);

module.exports = {
  server: app,
  start: (port) => {
		if (!port) { throw new Error('Missing Port'); }
    app.listen(port, () => {
      console.log(`Server Up on ${port}`);
    });
  },
};
