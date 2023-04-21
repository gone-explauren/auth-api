'use strict';

// All middleware has access to the request.
// Here, we're simply logging out the interesting parts
function logger (request, response, next) {
  let method = request.method;
  let path = request.path;
  console.log(`request received: ${method}, ${path}`);
  next();
}

module.exports = logger;