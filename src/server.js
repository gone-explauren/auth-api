'use strict';

// 3rd Party Resources
const express = require('express');
const cors = require('cors');


// Esoteric Resources
const errorHandler = require('./error-handlers/500.js');
const notFound = require('./error-handlers/404.js');
const logger = require('./middleware/logger.js');
const routes = require('./routes/v1.js');

// Prepare the express app
const app = express();

// App Level MW
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);

// Routes
app.use(routes);

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
