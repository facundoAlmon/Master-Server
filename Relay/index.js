var express = require('express')
var mongoose = require('mongoose')
var router = express.Router()

//Modelos


//Routes
var relay = require("./routes/relay")

//Ruteo
router.use("/", relay)

//Prohibir acceso a /
router.get('/', function(req, res) {
    res.send(404)
});

module.exports = router