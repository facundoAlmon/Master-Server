var express = require("express")
var RelayCtrl = require('../controllers/relay.js')
var Relay = express.Router()

Relay.get("/on/:id", RelayCtrl.turnOn)
Relay.get("/off/:id", RelayCtrl.turnOff)

module.exports = Relay