var mongoose = require('mongoose')
var Devices = mongoose.model('ESPDevices')
var config = require("config")

exports.turnOn = async function(req, res) {
    let device = await Devices.findById(req.params.id)
    if (!device) return res.status(500).send("No se encontro dispositivo")

    let found = false
    for (var i = 0; i < device.modulos.length; i++) {
        if (device.modulos[i] == "RELAY") found = true
    }
    if (!found) return res.status(500).send("Modulo no instalado")
    var resp = await switchRelay(device,1)
    if (resp.error == "X")
        return res.status(500).send(resp)
    return res.status(200).send(resp)
}

exports.turnOff = async function(req, res) {
    let device = await Devices.findById(req.params.id)
    if (!device) return res.status(500).send("No se encontro dispositivo")

    let found = false
    for (var i = 0; i < device.modulos.length; i++) {
        if (device.modulos[i] == "RELAY") found = true
    }
    if (!found) return res.status(500).send("Modulo no instalado")
    var resp = await switchRelay(device,0)
    if (resp.error == "X")
        return res.status(500).send(resp)
    return res.status(200).send(resp)
}

switchRelay = async(device, value) => {
    return new Promise(function(resolve, reject) {
        var http = require('http')
        var postDataStr = JSON.stringify({
            "relay1": value
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

