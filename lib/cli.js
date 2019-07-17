#!/usr/bin/env node
var fs = require("fs-extra");
var pluralize = require("pluralize");
var inquirer = require("inquirer");
const populate = require("./populate");
const path = require("path");
const appDir = "app_modules";
const testDir = "test_modules";
const makeTest = require("./samples/test/index");
const preparePostMan = require("./samples/doc/postman");
const prepareSwagger = require("./samples/doc/swagger");
const package = require("../package.json");

let schemaDirs = [];
const actions = {
  createEntity: async () => {
    return inquirer
      .prompt([
        {
          type: "list",
          name: "entityType",
          message: "Do you wnat this entity to be protected?",
          default: "prompt",
          choices: [
            {
              name: "Yes, user need to login to access this entity",
              value: "protected"
            },
            { name: "No, this will be public", value: "public" }
          ]
        }
      ])
      .then(async ({ entityType }) =>
        createEntityFiles(entityType === "public" ? false : true)
      );
  },
  createSchema: async () => {
    return inquirer
      .prompt([
        {
          type: "input",
          name: "dir",
          message: "Enter (valid) directory to create schema:"
        }
      ])
      .then(async ({ dir }) => {
        let exists = await fs.exists(appDir + "/" + dir);
        if (!exists) {
          return console.log(
            "\n\nRequested entity " +
              appDir +
              "/" +
              dir +
              " not found\nTry creating an entity first\n"
          );
        }
        let samplePath = path.join(__dirname, "samples/entity/schema.json");
        let entityPath = path.join(
          __dirname,
          "../",
          appDir + "/" + dir + "/schema.json"
        );
        fs.copy(samplePath, entityPath, function(err) {
          if (err) return console.error(err);
          console.log("> Schema created on: /" + appDir + "/" + dir);
        });
      });
  },
  createTestCode: async () => {
    var schemas = await scanSchema(appDir);
    let testFiles = await prepareTest(schemas);
    await generateTests(testFiles);
    return console.log("> Test cases generated successfully");
  },
  createDocumentation: async () => {
    return inquirer
      .prompt([
        {
          type: "list",
          name: "docs",
          message: "Which format do you prefer?",
          default: "prompt",
          choices: [
            { name: "PostMan", value: "postman" },
            { name: "Swagger", value: "swagger" },
            { name: "Doc", value: "msdoc" },
            { name: "PDF\n", value: "pdf" }
          ]
        }
      ])
      .then(async ({ docs }) => {
        switch (docs) {
          case "postman": // create postman collection
            var schemas = await scanSchema(appDir);
            let json = await prepareJSON(schemas);
            await makeFile("", package.name + ".postman_collection.json", json);
            return console.log("Postman Collection generated successfully");
          case "swagger": // create entity
            var schemas = await scanSchema(appDir);
            let swaggerJson = await prepareSwaggerJSON(schemas);
          //console.log(swaggerJson);
          // await makeFile(
          //   "",
          //   package.name + ".postman_collection.json",
          //   swaggerJson
          // );
          // return console.log("Swagger.json generated successfully");
          case "msdoc": // create doc
            return console.log("Not yet implemented");
          case "pdf": // create pdf
            return console.log("Not yet implemented");
        }
      });
  }
};
function promptUser() {
  return inquirer
    .prompt([
      {
        type: "list",
        name: "choice",
        message: "What would you like to do simply?",
        default: "prompt",
        choices: [
          { name: "Create Entity", value: "createEntity" },
          { name: "Create Schema", value: "createSchema" },
          { name: "Generate Test Code", value: "createTestCode" },
          { name: "Generate API Doc", value: "createDocumentation" }
        ]
      }
    ])
    .then(({ choice }) => actions[choice]());
}

const scanSchema = async (appDir, childProcess = false) => {
  let parts = appDir.split("/");
  if (parts.indexOf("schema.json") > -1) {
    let url = appDir.replace("/schema.json", "");
    let file = await fs.readFile(appDir, "utf8");
    let schema = JSON.parse(file);
    schemaDirs.push({ [url]: schema });
  } else {
    let directories = await fs.readdir(appDir).catch(e => {
      return [];
    });
    for (var i = 0; i < directories.length; i++) {
      await scanSchema(appDir + "/" + directories[i], true);
    }
    if (!childProcess) {
      return schemaDirs;
    }
  }
};
const prepareTest = async schemas => {
  let testSuites = [];
  for (var schemaDetails of schemas) {
    let schemaKeys = Object.keys(schemaDetails);
    for (key of schemaKeys) {
      let entities = key.split("/");
      let entity = entities[entities.length - 1];
      if (entity === appDir) {
        continue;
      }
      let sampleInputs = {};
      let vars = keyify(schemaDetails[key]);
      let testCases = await makeTest(entity, {
        test: 1,
        test2: 2,
        token: "5d22ff9a04f41d2b602f7257",
        name: "test",
        email: "test@test.com",
        password: "123456",
        mobile: "01670746301",
        userType: 1,
        status: "ACTIVE"
      });
      testSuites.push({ entity, testCases });
    }
  }
  return testSuites;
};
const generateTests = async tests => {
  for (var i = 0; i < tests.length; i++) {
    let testPath = path.join(__dirname, "../", testDir);
    let exists = await fs.exists(testPath);
    if (!exists) {
      console.log("> Creating test directory: /" + testPath);
      await fs.mkdir(testPath);
    }
    let entityTestPath = testPath + "/" + tests[i].entity + ".test.js";
    let res = await fs.writeFile(entityTestPath, tests[i].testCases);
  }
  return true;
};
const makeFile = async (dir, fileName, content) => {
  let route = path.join(__dirname, "../", dir);
  let exists = await fs.exists(route);
  if (!exists) {
    console.log("> Creating directory: /" + dir);
    await fs.mkdir(route);
  }
  let filePath = route + "/" + fileName;
  await fs.writeFile(filePath, JSON.stringify(content), "utf8");
  return true;
};
const prepareJSON = async schemas => {
  let app = {
    name: package.name,
    description: package.description,
    entities: []
  };
  for (var schemaDetails of schemas) {
    let schemaKeys = Object.keys(schemaDetails);
    for (key of schemaKeys) {
      let entities = key.split("/");
      let entity = entities[entities.length - 1];
      if (entity) {
        let api = [];
        let entitySchema = Object.keys(schemaDetails[key]);
        for (var method of entitySchema) {
          if (allowedMethods.indexOf(method) !== -1) {
            let apiObj = {
              method: method,
              name: method + " " + entity,
              task: methodTask[method] + entity,
              request: schemaDetails[key][method].input,
              response: schemaDetails[key][method].output
            };
            api.push(apiObj);
          }
        }
        app.entities.push({
          name: entity,
          api: api
        });
      }
      return preparePostMan(app);
    }
  }
};
const prepareSwaggerJSON = async schemas => {
  let app = {
    name: package.name,
    description: package.description,
    entities: []
  };
  for (var schemaDetails of schemas) {
    let schemaKeys = Object.keys(schemaDetails);
    for (key of schemaKeys) {
      let entities = key.split("/");
      let entity = entities[entities.length - 1];
      if (entity) {
        let api = [];
        let entitySchema = Object.keys(schemaDetails[key]);
        for (var method of entitySchema) {
          if (allowedMethods.indexOf(method) !== -1) {
            let apiObj = {
              method: method,
              name: method + " " + entity,
              task: methodTask[method] + entity,
              request: schemaDetails[key][method].input,
              response: schemaDetails[key][method].output
            };
            api.push(apiObj);
          }
        }
        app.entities.push({
          name: entity,
          api: api
        });
      }
      return prepareSwagger(app);
    }
  }
};
const allowedMethods = ["get", "post", "patch", "put", "delete"];
const methodTask = {
  get: "This API will retrieve ",
  post: "This API will create new ",
  patch: "This API will update single field of existing ",
  put: "This API will update existing ",
  delete: "This API will remove existing "
};
const createEntityFiles = protected => {
  return inquirer
    .prompt([
      {
        type: "input",
        name: "dir",
        message: "Enter entity name:"
      }
    ])
    .then(async ({ dir }) => {
      let exists = await fs.exists(appDir);
      if (!exists) await fs.mkdir(appDir);
      let sampleEntity = path.join(__dirname, "samples/entity");
      let protectedEntity = path.join(__dirname, "samples/protected-entity");
      let entityPath = path.join(__dirname, "../", appDir);
      let directories = dir.split("/");
      if (directories[directories.length - 1] === "") directories.pop();
      for (var current = 0; current < directories.length; current++) {
        entityPath = path.join(entityPath, directories[current]);
        exists = await fs.exists(entityPath);
        if (!exists) {
          await fs.copy(protected ? protectedEntity : sampleEntity, entityPath);
        }
      }
      console.log("Entity", dir, "Created successfully");
      return;
    });
};
const keyify = (obj, prefix = "") =>
  Object.keys(obj).reduce((res, el) => {
    if (Array.isArray(obj[el])) {
      return res;
    } else if (typeof obj[el] === "object" && obj[el] !== null) {
      return [...res, ...keyify(obj[el], el)];
    } else {
      return [...res, { [el]: obj[el] }];
    }
  }, []);
promptUser();
