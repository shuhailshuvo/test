// Import the dependencies for testing
const unit = "users";
var sampleValue = {};
const chai = require("chai");
const chaiHttp = require("chai-http");
var pluralize = require("pluralize");
const populate = require("../lib/populate");
const app = require("../index");
chai.use(chaiHttp);
chai.should();
const unitId = pluralize.singular(unit) + "Id";
sampleValue[unitId] = "";
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
  describe("::. Testing " + method + " " + baseUrl, () => {
    it("Should " + action[method] + " " + unit, done => {
      chai
        .request(app)
        [method](baseUrl)
        .set(headers)
        .send(body)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
