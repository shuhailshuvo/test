module.exports = response => {
  const dispatch = {
    response: data => {
      response.writeHead(200, {
        "Content-Type": "application/json",
        "X-Powered-By": ""
      });
      response.end(JSON.stringify(data));
    },
    exception: error => {
      response.writeHead(error.status || 500, {
        "Content-Type": "application/json",
        "X-Powered-By": ""
      });
      response.end(
        JSON.stringify({
          message: error.message || "Internal Error",
          data: error.data || {},
          location: error.location || "unknown"
        })
      );
    }
  };

  return dispatch;
};
