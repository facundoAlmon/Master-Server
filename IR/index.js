var express = require('express')
var mongoose = require('mongoose')
var router = express.Router()

//Modelos
require('./models/codes.js')(mongoose)

//Routes
var receiver = require("./routes/receiver")
var sender = require("./routes/sender")
var codes = require("./routes/codes")

//Ruteo
router.use("/receiver", receiver)
router.use("/sender", sender)
router.use("/codes", codes)

//Prohibir acceso a /
router.get('/', function(req, res) {
    res.send(404);
});

module.exports = router