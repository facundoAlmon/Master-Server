var express = require('express')
var mongoose = require('mongoose')
var router = express.Router()

//Modelos

//Routes
var luz = require("./routes/luz")

//Ruteo
router.use("/", luz)

//Prohibir acceso a /
router.get('/', function(req, res) {
    res.send(404)
});

module.exports = router