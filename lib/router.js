var Promise = require("bluebird");
var pluralize = require("pluralize");
var fs = Promise.promisifyAll(require("fs"));
var path = require("path");
const dir = "app_modules";

module.exports = (() => {
  const router = async context => {
    context.dispatch = require("./dispatch")(context.response);
    try {
      const url = context.request.url.trim();
      const urlTokens = tokenize(url);
      if (hasException(url, context.dispatch)) return;
      context = await formatRoute(urlTokens, context);
      await validateRequest(context);
      const app_module = require(context.component);
      await app_module(context);
    } catch (error) {
      console.log(error);
      return context.dispatch.exception(error);
    }
  };
  return router;
})();

const hasException = (url, dispatch) => {
  switch (url) {
    case "/":
      dispatch.response(501);
      return true;
    case "/favicon.ico":
      dispatch.exception(501);
      return true;
  }
  return false;
};

const tokenize = url => {
  let urlParts = url.split("?");
  let queryString = urlParts[1] ? urlParts[1].split("&") : [];
  urlParts = urlParts[0].split("/");
  let parts = [dir];
  for (var part of urlParts) {
    if (part !== "") parts.push(part);
  }
  return { route: parts, query: queryString };
};

const formatRoute = async (url, context) => {
  try {
    let { method, headers, body } = context.request;
    let path = "";
    let component = "";
    let req = {
      params: {},
      query: queryParser(url.query),
      headers,
      body
    };
    let lastEntity = "";
    let file;

    for (var directory of url.route) {
      let route = makeRoute(path, directory);
      let directoryExists = await readDirectory(route);
      if (!directoryExists) {
        req.params[pluralize.singular(lastEntity) + "Id"] = directory;
        continue;
      }
      lastEntity = directory;

      const middleWare = await checkMeddleWare(path, directory);
      if (middleWare) {
        const middleWareFunction = require(middleWare);
        await middleWareFunction(context);
      }
      path += `/${directory}`;
    }
    component = makeRoute(path, method.toLowerCase());
    let schemaFile = makeRoute(path, "schema.json");
    file = await fileExists(component + ".js");
    if (!file)
      throw {
        status: 405,
        message: `Yet to Implement ${method} /${directory}`
      };
    let hasSchema = await fileExists(schemaFile);
    if (!hasSchema) {
      console.log("run > simply create schema /" + directory);
      throw {
        status: 500,
        message: `No Schema found for ${method} /${directory}`
      };
    }
    let schema = await readFile(schemaFile);
    context.request = req;
    context.schema = schema;
    context.component = component;
    context.method = method;
    return context;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const checkMeddleWare = async (route, param) => {
  route = makeRoute(route, param, "index");
  let file = false;
  try {
    exists = await fs.existsSync(route + ".js");
    if (exists) file = route;
  } catch (e) {}
  return file;
};

const makeRoute = (base, directory, file = "", ext = "") => {
  let formattedUrl = `${base}/${directory}`;
  if (file !== "") {
    formattedUrl += `/${file}`;
    if (ext !== "") {
      formattedUrl += `/${ext}`;
    }
  }
  return path.join(__dirname, "../", `${formattedUrl}`);
};

const readDirectory = route => {
  return fs
    .readdirAsync(route)
    .then(subDir => true)
    .catch(e => false);
};
const readFile = path => {
  let data = fs.readFileSync(path);
  return JSON.parse(data.toString());
};
const queryParser = queryArr => {
  let query = {};
  for (var qs of queryArr) {
    let q = qs.split("=");
    query[q[0]] = q[1];
  }
  return query;
};

const fileExists = path => {
  try {
    return fs.existsSync(path);
  } catch (e) {
    return false;
  }
};
const validateRequest = ({ method, schema, request, Validator }) => {
  method = method.toLowerCase();
  let rules = schema.all || schema[method];
  let inputRules = rules.input;
  for (type of Object.keys(request)) {
    let validation = new Validator(request[type], inputRules[type]);
    if (!validation.passes()) {
      throw {
        status: 400,
        message: "Invalid Input.",
        data: validation.errors.all(),
        location: type
      };
    }
  }
};
