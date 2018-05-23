"use strict"

process.env['NODE_CONFIG_DIR'] = "./"
process.env.INSTANCE_ID = process.env.NODE_APP_INSTANCE

const express = require("express"),
    cors = require('cors'),
    bodyParser = require("body-parser"),
    http = require('http'),
    app = express(),
    server = require('http').Server(app),
    compress = require('compression'),
    config = require('config')
var mongoose = require('mongoose')   
mongoose.Promise = global.Promise 
var mongoUrl
var replSetURI = ""
if (config.mongo.replsetMembers) replSetURI = "," + config.mongo.replsetMembers
if (config.mongo.user) {
    mongoUrl = 'mongodb://' + config.mongo.user + ":" + config.mongo.pass + "@" + config.mongo.host + ':' + config.mongo.port + replSetURI + '/' + config.mongo.db
} else {
    mongoUrl = 'mongodb://' + config.mongo.host + ':' + config.mongo.port + replSetURI + '/' + config.mongo.db
}
var options = {
    poolSize: 50,
    ssl: config.mongo.ssl,
    useMongoClient: true,
    replicaSet: config.mongo.replicaSet,
    readPreference: config.mongo.readPreference
}

mongoose.connect(mongoUrl, options, function(err, res) {
  if (err) throw err;
  console.log('Connected to Database');
});
// Middlewares
app.use(bodyParser.json({
    limit: '50mb'
}))
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}))
app.use(cors())
app.use(compress())
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization')
    next()
})
app.disable('x-powered-by')

//APIs
var routesESP = require("./ESP")
app.use("/api/esp", routesESP)

var routesIR = require("./IR")
app.use("/api/ir", routesIR)

var routesDHT = require("./DHT")
app.use("/api/dht", routesDHT)

var routesRelay = require("./Relay")
app.use("/api/relay", routesRelay)

var routesLuz = require("./Luz")
app.use("/api/luz", routesLuz)

//Frontend
/*var routesFrontend = require("./Frontend");
app.use("/", routesFrontend);*/
app.use(express.static(__dirname + '/App'));
app.get('/api/*', function(request, response) {
    response.status(404).send("Not Found");
});
app.get('*', function(request, response) {
    response.sendFile(__dirname + '/App/index.html');
});

server.listen(process.env.PORT || config.httpPort)
console.log("Servidor Iniciado. Puerto HTTP: " + (process.env.PORT || config.httpPort))