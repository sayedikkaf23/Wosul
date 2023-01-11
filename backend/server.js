require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
setting_detail = {};
global.__basedir = __dirname;
// process.setMaxListeners(0);

global.env = process.env;
console.log("NODE_ENV: -- >>>>>>", process.env.NODE_ENV);
init();
function init() {
  var mongoose = require("./config/mongoose"),
    db = mongoose(),
    app = require("./config/express")();
  const port = "8000";
  app.use(cors());
  app.use(express.static(path.join(__dirname, "public")));
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origins: ["*"],
    },
  });
  io.on("connection", (socket) => {
    console.log("socket connected >>>", socket.id);
  });
  global.io = io;
  server.listen(port, "0.0.0.0");
  console.log("Magic happens on port " + port);
  var Setting = require("mongoose").model("setting");
  Setting.findOne({}, function (error, setting) {
    setting_detail = setting;
  });
  process.on("uncaughtException", function (err) {
    console.log("uncaughtException->>" + err);
    throw err;
  });
  exports = module.exports = app;
}
