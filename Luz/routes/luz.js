var express = require("express")
var LuzCtrl = require('../controllers/luz.js')
var Luz = express.Router()

Luz.get("/:id", LuzCtrl.getLuz)

module.exports = Luz