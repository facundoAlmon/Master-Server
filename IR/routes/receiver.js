var express = require("express")
var ReceiverCtrl = require('../controllers/receiver.js')
var Receiver = express.Router()

Receiver.get("/read/:id", ReceiverCtrl.readIR)

module.exports = Receiver