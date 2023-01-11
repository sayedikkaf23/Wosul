// var express = require("express");
// var mongoose = require("mongoose");
// var bodyParser = require("body-parser");
// var methodOverride = require("method-override");
// var http = require("http");
setting_detail = {};
global.__basedir = __dirname;
process.env.NODE_ENV = process.env.NODE_ENV || "development";
// if (process.env.NODE_ENV == 'production') {
//     var cluster = require('cluster');
//     if (cluster.isMaster) {
//         // Count the machine's CPUs
//         var cpuCount = require('os').cpus().length;

//         // Create a worker for each CPU
//         for (var i = 0; i < cpuCount; i += 1) {
//             cluster.fork();
//         }

// // Code to run if we're in a worker process
//     } else {
//         init();
//     }
// } else {
//     init();
// }

init();

function init() {
  var config = require("./config/config"),
    mongoose = require("./config/mongoose"),
    express = require("./config/express"),
    db = mongoose(),
    app = express();
  const port = "8001";
  app.listen(port);

  var Setting = require("mongoose").model("setting");
  Setting.findOne({}, function (error, setting) {
    setting_detail = setting;
    console.log("Magic happens on port " + port);
  });
  exports = module.exports = app;
}
