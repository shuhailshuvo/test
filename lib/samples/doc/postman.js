var pluralize = require("pluralize");
const populate = require("../../populate");
var headers = [
  {
    key: "Content-Type",
    name: "Content-Type",
    value: "application/json",
    type: "text"
  }
];

module.exports = async App => {
  let fileData = prepareJSONStructure(App.name);
  let entities = App.entities;

  for (var i = 0; i < entities.length; i++) {
    let entity = entities[i];
    const folder = prepareFolderStructure(entity.name);
    const unitId = pluralize.singular(folder.name) + "Id";

    for (var j = 0; j < entity.api.length; j++) {
      let api = entity.api[j];
      folder.description += `${j + 1}. ${api.name}\n`;

      if (!api || !api.request) continue;

      let request = api.request;
      let params = prepareParam(request, unitId);
      let name = prepareApiName(request, unitId, api.name);
      let paramRequired = isParamRequired(request, unitId);
      let pathName = entity.name + params;
      let apiRoute = prepareApiStructure(api, headers, pathName, request, name);

      folder.item.push({ ...apiRoute });

      if (params && !paramRequired) {
        let routeExceptParams = prepareApiWithoutParam(
          JSON.parse(JSON.stringify(apiRoute)),
          entity.name,
          api.name
        );

        folder.item.push({ ...routeExceptParams });
      }
    }
    fileData.item.push(folder);
  }
  return fileData;
};

const prepareJSONStructure = name => {
  return {
    info: {
      _postman_id: "8f2b32b4-672d-468c-b3d5-5b606807e021",
      name: name,
      description: `# [${name} ](https://yourWebSite.com)\r\n\r\n----\r\n Please mention the project details. What is this project about? its purpose or some basic information you want to share with developers of this project.\r\n--------\r\n\r\n## Special Instruction    mention special instruction, if any.`,
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [],
    variable: [
      {
        id: "cb9edebe-4a4e-467f-ab4d-aa695f559c7b",
        key: "API",
        value: "http://localhost:5000",
        type: "string"
      }
    ]
  };
};

const prepareFolderStructure = name => {
  return {
    name: name,
    description: `# ${name}\r\n----\r\n\r\n What is this entity for? What APIs you need on this entity?\r\n----\r\n\r\n## APIs\n`,
    item: []
  };
};

const prepareApiStructure = (api, headers, pathName, request, name) => {
  return {
    name: name,
    request: {
      method: api.method,
      header: headers,
      body: {
        mode: "raw",
        raw: JSON.stringify(request.body)
      },
      url: {
        raw: `${"{{API}}"}/${pathName}`,
        host: [`${"{{API}}"}`],
        path: [`${pathName}`]
      },
      description: `# ${api.name}\r\n----\r\n\r\n ${api.task}
        \r\n----\r\n\r\n## Request\r\n----\r\n## Headers\r\n
        \r\n
${JSON.stringify(request.headers)}
        
        \r\n\r\n### Query\r\n
        \r\n
${JSON.stringify(request.query)}
        \r\n\r\n## Response\r\n\r\n## Body
        \r\n
${JSON.stringify(api.response.body)}
        \r\n----\r\n\r\n## Special Note\r\n    If any...`
    },
    response: []
  };
};

const prepareParam = (request, unitId) => {
  return request.params && request.params[unitId]
    ? "/" + populate(request.params[unitId])
    : "";
};

const prepareApiName = (request, unitId, entity) => {
  return request.params && request.params[unitId] ? entity + " by ID" : entity;
};

const isParamRequired = (request, unitId) => {
  return request.params &&
    request.params[unitId] &&
    request.params[unitId].indexOf("required") !== -1
    ? true
    : false;
};

const prepareApiWithoutParam = (apiObj, pathName, entity) => {
  let routeExceptParams = apiObj;
  routeExceptParams.name = entity;
  routeExceptParams.request.url.raw = `${"{{API}}"}/${pathName}`;
  routeExceptParams.request.url.path = `${pathName}`;
  return routeExceptParams;
};
