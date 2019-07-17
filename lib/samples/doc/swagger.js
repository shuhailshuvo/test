module.exports = App => {
  console.log(App);
  console.log(App.entities[0].api);
  let fileData = {
    swagger: "2.0",
    host: "localhost:5000",
    info: {
      version: "1.0.0",
      title: App.name,
      description: `# [${
        App.name
      } ](https://yourWebSite.com)\r\n\r\n----\r\n Please mention the project details. What is this project about? its purpose or some basic information you want to share with developers of this project.\r\n--------\r\n\r\n## Special Instruction    mention special instruction, if any.`,
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    paths: [],
    definitions: []
  };

  for (var i = 0; i < App.entities.length; i++) {
    let folder = {
      name: App.entities[i].name,
      description: `# ${
        App.entities[i].name
      }\r\n----\r\n\r\n What is this entity for? What APIs you need on this entity?\r\n----\r\n\r\n## APIs\n`,
      item: []
    };
    for (var j = 0; j < App.entities[i].api.length; j++) {
      if (App.entities[i].api[j]) {
        folder.description += `${j + 1}. ${App.entities[i].api[j].name}\n`;
      }
    }

    let headers = [
      {
        key: "Content-Type",
        name: "Content-Type",
        value: "application/json",
        type: "text"
      }
    ];
    for (var j = 0; j < App.entities[i].api.length; j++) {
      let api = App.entities[i].api[j];
      if (api && api.request) {
        let apiRoute = {
          name: api.name,
          request: {
            method: api.method,
            header: JSON.stringify(headers),
            url: {
              raw: `${"{ route }"}/${App.entities[i].name}`,
              host: [`${"{route}"}`],
              path: [`${App.entities[i].name}`]
            },
            description: `# ${api.name}\r\n----\r\n\r\n ${api.task}
            \r\n----\r\n\r\n## Request\r\n----\r\n## Headers\r\n
            \r\n
${JSON.stringify(api.request.headers)}
            
            \r\n\r\n### Query\r\n
            \r\n
${JSON.stringify(api.request.query)}
            \r\n\r\n## Response\r\n\r\n## Body
            \r\n
${JSON.stringify(api.response.body)}
            \r\n----\r\n\r\n## Special Note\r\n    If any...`
          },
          response: []
        };
        folder.item.push(apiRoute);
      }
    }
    fileData.paths.push(folder);
  }

  return fileData;
};
