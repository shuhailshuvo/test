// mock data
module.exports = rule => {
  if (!rule) {
    return {};
  }
  if (typeof rule === "object") {
    let sampleInput = {};
    for (var i = 0; i < Object.keys(rule).length; i++) {
      let key = Object.keys(rule)[i];
      if (rule[key]) {
        let fieldRule = rule[key].replace("required|", "");
        sampleInput[key] = populated[fieldRule];
      }
    }

    return sampleInput;
  } else {
    rule = rule.replace("required|", "");
    return populated[rule];
  }
};

const populated = {
  "string|size:24": "5d2bfdfbb34fbe1988f1e31c",
  "size:24": "5d2bfdfbb34fbe1988f1e31c",
  numeric: 1234567890,
  string: "sample string",
  array: [],
  "in:ACTIVE,INACTIVE": "ACTIVE",
  "in:c,d": "c",
  date: new Date(),
  email: "test@email.com"
};
