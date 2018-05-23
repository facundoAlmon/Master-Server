var express = require("express")
var CodesCtrl = require('../controllers/codes.js')
var Codes = express.Router()

Codes.post("/", CodesCtrl.createCode)
Codes.get("/", CodesCtrl.getCodes)
Codes.get("/:id", CodesCtrl.getCode)
Codes.put("/:id", CodesCtrl.updateCode)
Codes.delete("/:id", CodesCtrl.deleteCode)

module.exports = Codes