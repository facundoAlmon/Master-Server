var express         = require("express");
var SenderCtrl   = require('../controllers/sender.js');
var Sender = express.Router();

Sender.post("/send", SenderCtrl.sendIR)

module.exports = Sender;