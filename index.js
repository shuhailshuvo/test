const simply = require("./lib");
const mongoose = require("./adapters/mongoose");
const auth = require("./adapters/auth");

const app = simply
  .init()
  .auth(auth)
  .run(5000);

module.exports = app;
/*
    - logger
    - router
    - response handler
    - db
    - cors
    - stream
    - buffer
    - file
*/
