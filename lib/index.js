const http = require("http");
var fs = require("fs");
var path = require("path");

require("dotenv").config();
var pluralize = require("pluralize");
require("dotenv").config();
let Validator = require("validatorjs");
const router = require("./router");
var server;
var context = { Validator, models: {} };

const simply = {
  init: () => {
    global.appDir = path.join(__dirname, "../");
    try {
      let validStructure = validateStructure("app_modules", [], false);
      if (!validStructure) return;
      server = http.createServer((req, res) => {
        context.request = req;
        context.response = res;
        context.env = process.env;
        req.on("data", data => {
          context.request.body = JSON.parse(data.toString());
        });
        req.on("end", () => {
          router(context);
        });
      });

      return simply;
    } catch (e) {
      console.log(e);
    }
  },
  secure: () => {
    var crypto = require("crypto");
    var privateKey = fs.readFileSync("privatekey.pem").toString();
    var certificate = fs.readFileSync("certificate.pem").toString();
    var credentials = crypto.createCredentials({
      key: privateKey,
      cert: certificate
    });
    server.setSecure(credentials);
    return simply;
  },
  auth: auth => {
    return simply;
  },
  log: (data, destination) => {
    switch (destination) {
      case "console":
        console.log(data);
        break;
      default:
        console.log(data);
        break;
    }
    return simply;
  },
  run: port => {
    console.log("Running on", port);
    server.listen(port, (callback = loader));
    return server;
  }
};

const loader = () => {
  //chalkAnimation.rainbow("Server is Running");
};

const validateStructure = async (appDir, files, childProcess) => {
  files[appDir] = [];
  let directories = await fs.readdirAsync(appDir).catch(e => {
    throw `E R R O R S [ 1 ]\n=================\nNo entity found, Try this command to create one\n
    >> simply create entity [yourEntityName]\n`;
  });

  for (var i = 0; i < directories.length; i++) {
    let directory = await fs
      .statSync(appDir + "/" + directories[i])
      .isDirectory();
    if (!directory) {
      files[appDir].push(directories[i]);
    } else {
      let isPlural = pluralize.isPlural(directories[i]);
      if (!isPlural) {
        throw `E R R O R S [ 1 ]\n=================
  Entity name (${directories[i]}) should be plural\n`;
      }
      await validateStructure(appDir + "/" + directories[i], files, true);
    }
  }
  if (!childProcess) {
    let errors = validate(files);
    if (errors.length > 0) {
      console.log(`E R R O R S [ ${errors.length} ]\n=================`);
      errors.map(error => console.log("==>", error));
      return false;
    }
    return true;
  }
};

const validate = entities => {
  let errors = [];
  for (var i = 0; i < Object.keys(entities).length; i++) {
    let path = Object.keys(entities)[i];
    if (path === "app_modules") continue;
    let route = path.replace("app_modules", "");
    let files = entities[path];
    if (files.indexOf("schema.json") === -1) {
      errors.push(`Schema is missing for ${route}`);
    }
    let totalFiles = 0;
    for (file of files) {
      let pos = allowedFiles.indexOf(file);
      if (pos === -1) {
        errors.push(
          `Unexpected ${file} on ${route}. No additional files on app_modules`
        );
      } else {
        totalFiles++;
      }
    }
    if (totalFiles < 2) {
      errors.push(
        `${route} should have atleast one method impleted and a schema file`
      );
    }
  }
  return errors;
};

const allowedFiles = [
  "index.js",
  "get.js",
  "post.js",
  "put.js",
  "patch.js",
  "delete.js",
  "schema.json"
];

module.exports = simply;
