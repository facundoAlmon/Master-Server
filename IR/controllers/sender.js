var mongoose = require('mongoose')
var IRCodes = mongoose.model('IRCodes')
var Devices = mongoose.model('ESPDevices')
var config = require("config")

exports.sendIR = async(req, res) => {
    if (!req.body.deviceID) return res.status(500).send("No se envio ID de dispositivo")
    let device = await Devices.findById(req.body.deviceID)
    if (!device.host) return res.status(500).send("No se encontro dispositivo")
    let code
    let tipo

    if (req.body._id) {
        let codeDB = await IRCodes.findById(req.body._id)
        code = codeDB.codigoDec
        tipo = codeDB.tipo
    } else if ((req.body.codigo) && (req.body.tipo)) {
        code = req.body.codigo
        tipo = req.body.tipo
    } else {
        return res.status(500).send("No se envio ID, codigo o tipo.")
    }


    let found = false
    for (var i = 0; i < device.modulos.length; i++) {
        if (device.modulos[i] == "IRSender") found = true
    }
    if (!found) return res.status(500).send("Modulo no instalado")

    var http = require('http')
    var postDataStr = JSON.stringify({
        "irSend": code,
        "irType": tipo
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
                resp.mensaje = "OK"
                return res.status(200).send(resp)
            } else {
                resp.error = "X"
                if (typeof respuesta === 'string') {
                    resp.mensaje = respuesta
                } else {
                    resp.mensaje = "Error de envio"
                }
                return res.status(500).send(resp)
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
        return res.status(500).send(resp)
    });
    ESPreq.on('error', function() {
        if (error == "") {
            error = "X"
            let resp = {}
            resp.error = "X"
            resp.mensaje = "Error en llamada"
            return res.status(500).send(resp)
        } else {
            return null;
        }
    });
    ESPreq.write(postDataStr)
    ESPreq.end()
}