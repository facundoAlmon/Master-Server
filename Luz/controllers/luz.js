var mongoose = require('mongoose')
var DHTValues = mongoose.model('DHTValues')
var Devices = mongoose.model('ESPDevices')
var config = require("config")

exports.getLuz = async function(req, res) {
    let device = await Devices.findById(req.params.id)
    if (!device.host) return res.status(500).send("No se encontro dispositivo")

    let found = false
    for (var i = 0; i < device.modulos.length; i++) {
        if (device.modulos[i] == "LUZ") found = true
    }
    if (!found) return res.status(500).send("Modulo no instalado")
    var resp = await getLuz(device)
    if (resp.error == "X")
        return res.status(500).send(resp)
    return res.status(200).send(resp)
}

getLuz = async(device) => {
    return new Promise(function(resolve, reject) {
        var http = require('http')
        var postDataStr = JSON.stringify({
            "luz": 1
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
                    resp.luz = respuesta.luz
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
            if (device.modulos[i] == "LUZ") found = true
        }
        if (found) {
            let resp = await getLuz(device)
            if (resp.error != "X") {
                let valueLuz = new DHTValues({
                    deviceID: device._id,
                    date: new Date(),
                    tipo: "L",
                    valor: resp.luz
                })
                await valueLuz.save()
            }
        }
    })
}