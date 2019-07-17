const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
mongoose
  .connect(process.env.MONGODB, { useNewUrlParser: true })
  .then(response => {
    // console.info("Mongodb connected");
    module.export = mongoose;
  })
  .catch(err => {
    console.error(err);
  });
