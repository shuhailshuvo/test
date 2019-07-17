module.exports = (unit, sampleValue) => {
  return `// Import the dependencies for testing
  const unit = "${unit}";
  var sampleValue = {};
  const chai = require("chai");
  const chaiHttp = require("chai-http");
  var pluralize = require("pluralize");
  const populate=require("../lib/populate")
  const app = require("../index");
  chai.use(chaiHttp);
  chai.should();
  const unitId = pluralize.singular(unit) + "Id";
  sampleValue[unitId]="";
  const types = {
    string: "string",
    numeric: "number",
    array: "array",
    object: "object",
    date: "date"
  };
  const action = {
    get: "Retrive",
    post: "Create",
    put: "Update",
    patch: "Minor Update",
    delete: "Remove"
  };
  const allowedMethods = {
    get: 2,
    post: 1,
    patch: 3,
    put: 4,
    delete: 5
  };
  const schema = require(appDir + "/app_modules/" + unit + "/schema.json");
  let methods = Object.keys(schema);
  methods = methods.sort((a, b) => allowedMethods[a] - allowedMethods[b]);
  
  before(done => {
    // prepare the environment
    setTimeout(() => {
      done();
    }, 1500);
  });
  
  describe("::. " + unit.toUpperCase() + " MODULE ::.", () => {
    for (var i = 0; i < methods.length; i++) {
      if (allowedMethods[methods[i]] > -1) {
        let method = methods[i];
  
        let schemaObj = schema[method];
        let inputSchema = schemaObj.input;
        let outputSchema = schemaObj.output;
        let baseUrl = "/" + unit;
        let params = "";
        let queryString = "";
        let headers = {};
        let body = {};
        if (inputSchema.params[unitId]) {
          params = populate(inputSchema.params[unitId]);
        }
        if (inputSchema.query) {
          let qs = populate(inputSchema.query);
          let query = Object.keys(qs);
          queryString = "/?";
          for (var j = 0; j < query.length; j++) {
            queryString += query[j] + "=" + qs[query[j]];
            if (j < query.length - 1) {
              queryString += "&";
            }
          }
        }
        headers = populate(inputSchema.headers);
        body = populate(inputSchema.body);
  
        describe("::. Testing " + method + " " + baseUrl, () => {
          if (
            !inputSchema.params[unitId] ||
            inputSchema.params[unitId].indexOf("required") === -1
          ) {
            // try the base url
            it("Should " + action[method] + " " + unit, done => {
              chai
                .request(app)
                [method](baseUrl)
                .set(headers)
                .send(body)
                .end((err, res) => {
                  res.should.have.status(200);
                  if (method === "get") {
                    sampleValue[unitId] = res.body[0]._id;
                    describe("::. Response of " + method + " " + baseUrl, () => {
                      it("Response should be array", done => {
                        res.body.should.be.a("array");
                        done();
                      });
                      Object.keys(outputSchema.body).map(field => {
                        let rules = outputSchema.body[field];
                        rules = rules.split("|");
                        if (rules.indexOf("required") !== -1) {
                          it("Response should contain " + field, done => {
                            res.body[0].should.have.property(field);
                            done();
                          });
                          Object.keys(types).map(type => {
                            if (rules.indexOf(type) !== -1) {
                              it(field + " should be " + types[type], done => {
                                res.body[0][field].should.be.a(types[type]);
                                done();
                              });
                            }
                          });
                        }
                      });
                    });
  
                    done();
                  } else {
                    describe("::. Response of  " + method + " " + baseUrl, () => {
                      it("Response should be Object", done => {
                        res.body.should.be.a("object");
                        done();
                      });
                      sampleValue[unitId] = res.body._id;
                      Object.keys(outputSchema.body).map(field => {
                        let rules = outputSchema.body[field];
                        rules = rules.split("|");
                        if (rules.indexOf("required") !== -1) {
                          it("Response should contain " + field, done => {
                            res.body.should.have.property(field);
                            done();
                          });
                          Object.keys(types).map(type => {
                            if (rules.indexOf(type) !== -1) {
                              it(field + " should be " + types[type], done => {
                                res.body[field].should.be.a(types[type]);
                                done();
                              });
                            }
                          });
                        }
                      });
                    });
                    done();
                  }
                });
            });
            it(
              "Invalid request to " +
                action[method] +
                " " +
                unit +
                " should return error",
              done => {
                chai
                  .request(app)
                  [method](baseUrl)
                  .set({})
                  .send({})
                  .end((err, res) => {
                    describe(
                      "::. Error response of " + method + " " + baseUrl,
                      () => {
                        it("status should be 400", done => {
                          res.should.have.status(400);
                          done();
                        });
                        it("Should be object", done => {
                          res.body.should.be.a("object");
                          done();
                        });
                        it("Should contain message", done => {
                          res.body.should.have.property("message");
                          done();
                        });
                        it("Should contain data", done => {
                          res.body.should.have.property("data");
                          done();
                        });
                        done();
                      }
                    );
                  });
              }
            );
          }
  
          if (inputSchema.params[unitId]) {
            it(
              "Should " + action[method] + " single " + pluralize.singular(unit),
              done => {
                params = "/" + sampleValue[unitId];
                chai
                  .request(app)
                  [method](baseUrl + params + queryString, body)
                  .set(headers)
                  .end((err, res) => {
                    describe(
                      "::. Response of " + method + " " + baseUrl + "" + params,
                      () => {
                        it("Response status should be 200", done => {
                          res.should.have.status(200);
                          done();
                        });
                        it("Response status should be", done => {
                          res.body.should.be.a("object");
                          done();
                        });
                        it("Response should be Object", done => {
                          res.body.should.be.a("object");
                          done();
                        });
                        sampleValue[unitId] = res.body._id;
                        Object.keys(outputSchema.body).map(field => {
                          let rules = outputSchema.body[field];
                          rules = rules.split("|");
                          if (rules.indexOf("required") !== -1) {
                            it("Response should contain " + field, done => {
                              res.body.should.have.property(field);
                              done();
                            });
                            Object.keys(types).map(type => {
                              if (rules.indexOf(type) !== -1) {
                                it(field + " should be " + types[type], done => {
                                  res.body[field].should.be.a(types[type]);
                                  done();
                                });
                              }
                            });
                          }
                        });
                      }
                    );
                    done();
                  });
              }
            );
  
            it(
              "Invalid request to " +
                method +
                " " +
                unit +
                "/ID should return error",
              done => {
                params = "/11111a11111a11111a111111";
                chai
                  .request(app)
                  [method](baseUrl + params + queryString, body, headers)
                  .set({})
                  .send({})
                  .end((err, res) => {
                    describe(
                      "::. Error response of " + method + " " + baseUrl + params,
                      () => {
                        it("status should be 400", done => {
                          res.should.have.status(400);
                          done();
                        });
                        it("Should be object", done => {
                          res.body.should.be.a("object");
                          done();
                        });
                        it("Should contain message", done => {
                          res.body.should.have.property("message");
                          done();
                        });
                        it("Should contain data", done => {
                          res.body.should.have.property("data");
                          done();
                        });
                        done();
                      }
                    );
                  });
              }
            );
          }
        });
      }
    }
  });`;
};
