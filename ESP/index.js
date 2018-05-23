var express = require('express')
var mongoose = require('mongoose')
var router = express.Router()

//Modelos
require('./models/devices.js')(mongoose)

//Routes
var devices = require("./routes/devices")

//Ruteo
router.use("/devices", devices)

//Prohibir acceso a /
router.get('/', function(req, res) {
    res.send(404)
});

module.exports = router