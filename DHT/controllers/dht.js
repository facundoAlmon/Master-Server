var mongoose = require('mongoose')
var DHTValues = mongoose.model('DHTValues')
var Devices = mongoose.model('ESPDevices')
var config = require("config")
const moment = require('moment')

exports.getTemp = async function(req, res) {
    let device = await Devices.findById(req.params.id)
    if (!device.host) return res.status(500).send("No se encontro dispositivo")

    let found = false
    for (var i = 0; i < device.modulos.length; i++) {
        if (device.modulos[i] == "DHT") found = true
    }
    if (!found) return res.status(500).send("Modulo no instalado")
    var resp = await getTemp(device)
    if (resp.error == "X")
        return res.status(500).send(resp)
    return res.status(200).send(resp)
}

exports.getHistorial = async function(req, res) {
    let device = await Devices.findById(req.params.id)
    let found = false
    let tipos = []
    for (var i = 0; i < device.modulos.length; i++) {
        if (device.modulos[i] == "DHT"){
            found = true
            tipos.push("H")
            tipos.push("T")
        } 
        if (device.modulos[i] == "LUZ"){
            found = true
            tipos.push("L")
        } 
    }
    if (!found) return res.status(500).send("El dispositivo no contiene modulos para historial")
    if (!req.query.from) return res.status(500).send("No se envio fecha de inicio")
    if (!req.query.to) return res.status(500).send("No se envio fecha de fin")
    var agregationPipes = leerAgregacion("HistorialSensores");
    var fromDate = moment(req.query.from, "DD/MM/YYYY");
    var toDate = moment(req.query.to, "DD/MM/YYYY");
    agregationPipes[0] = {
        $match: {
            $and: [{
                date: {
                    $gte: fromDate.toDate()
                }
            }, {
                date: {
                    $lte: toDate.hours(23).minutes(59).seconds(59).toDate()
                }
            }, {
                tipo: { $in: tipos }
            }, {
                valor: { $ne: null }
            }, {
                deviceID: { $eq: req.params.id }
            }]
        }
    }
    let historial = await DHTValues.aggregate(agregationPipes)
    return res.status(200).send(historial)
}

getTemp = async(device) => {
    return new Promise(function(resolve, reject) {
        var http = require('http')
        var postDataStr = JSON.stringify({
            "dht": 1
        })
        var options = {
            hostname: device.host,
            port: device.puerto,
            path: "/",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postDataStr.length
            }
        }
        var ESPreq = http.request(options, function(resESP) {
            var statusHTTP = resESP.statusCode
            var headersHTTP = JSON.stringify(resESP.headers)

            var respuestaStr = ""
            resESP.setEncoding('utf8')

            resESP.on('data', function(chunk) {
                respuestaStr = respuestaStr + chunk
            });
            resESP.on('end', function() {
                try {
                    respuesta = JSON.parse(respuestaStr)
                    respuesta.httpStat = statusHTTP
                } catch (err) {
                    respuesta = respuestaStr
                }
                let resp = {}
                if (typeof respuesta !== 'undefined') {
                    resp.error = ""
                    resp.temp = respuesta.dhtTemp
                    resp.humedad = respuesta.dhtHum
                    return resolve(resp)
                } else {
                    resp.error = "X"
                    if (typeof respuesta === 'string') {
                        resp.mensaje = respuesta
                    } else {
                        resp.mensaje = "Error de envio"
                    }
                    return resolve(resp)
                }
            })
        })
        ESPreq.setTimeout(60000)
        var error = ""
        ESPreq.on('timeout', function() {
            error = "X"
            let resp = {}
            resp.error = "X"
            resp.mensaje = "Timeout con ESP"
            return resolve(resp)
        });
        ESPreq.on('error', function() {
            if (error == "") {
                error = "X"
                let resp = {}
                resp.error = "X"
                resp.mensaje = "Error en llamada"
                return resolve(resp)
            } else {
                return null;
            }
        });
        ESPreq.write(postDataStr)
        ESPreq.end()
    })
}

var CronJob = require('cron').CronJob
var job = new CronJob(config.cronDHT, onCronDHT, null,
    true,
    'America/Buenos_Aires'
)

async function onCronDHT() {
    let devices = await Devices.find()
    devices.forEach(async function(device) {
        let found = false
        for (var i = 0; i < device.modulos.length; i++) {
            if (device.modulos[i] == "DHT") found = true
        }
        if (found) {
            let resp = await getTemp(device)
            if (resp.error != "X") {
                let valueTemp = new DHTValues({
                    deviceID: device._id,
                    date: new Date(),
                    tipo: "T",
                    valor: resp.temp
                })
                let valueHum = new DHTValues({
                    deviceID: device._id,
                    date: new Date(),
                    tipo: "H",
                    valor: resp.humedad
                })
                await valueTemp.save()
                await valueHum.save()
            }
        }
    })
}

function leerAgregacion(nombre) {
    var fs = require('fs');
    var stripJSONComments = require('strip-json-comments');
    var fullpath = __dirname + "/../aggregations/" + nombre + ".js";
    var data = fs.readFileSync(fullpath, 'utf8');
    if (!data) return cb("error de lectura de agregacion", null);
    /*   console.log(
           escapeSpecialChars(stripJSONComments(data.substring(data.indexOf("["), data.lastIndexOf("]") + 1))).substring(94932, 94950)
       );*/
    var data = JSON.parse(escapeSpecialChars(stripJSONComments(data.substring(data.indexOf("["), data.lastIndexOf("]") + 1))));
    return data;
}

function escapeSpecialChars(jsonString) {
    return jsonString.replace(/\n/g, "\\n")
        .replace(/\\n/g, "")
        .replace(/\\t/g, "")
        .replace(/(['"])?([.a-zA-Z0-9_$]+)([' "])?:/g, '"$2": ')
        .replace(/},\s*}/g, '}}')
        .replace(/},\s*]/g, '}]');
}