var express = require("express")
var DHTCtrl = require('../controllers/dht.js')
var DHT = express.Router()

DHT.get("/:id", DHTCtrl.getTemp)
DHT.get("/historial/:id", DHTCtrl.getHistorial)

module.exports = DHT