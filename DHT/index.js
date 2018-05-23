var express = require('express')
var mongoose = require('mongoose')
var router = express.Router()

//Modelos
require('./models/DHTValues.js')(mongoose)

//Routes
var dht = require("./routes/dht")

//Ruteo
router.use("/", dht)

//Prohibir acceso a /
router.get('/', function(req, res) {
    res.send(404)
});

module.exports = router