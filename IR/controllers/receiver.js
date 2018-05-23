var mongoose = require('mongoose')
var Devices = mongoose.model('ESPDevices')
var config = require("config")

exports.readIR = function(req, res) {
    var q = Devices.findById(req.params.id)
    q.exec(function(err, device) {
        if (err) return res.status(500).send(err)
        let found = false
        for (var i = 0; i < device.modulos.length; i++) {
            if (device.modulos[i] == "IRReceiver") found = true
        }
        if (!found) return res.status(500).send("Modulo no instalado")

        var http = require('http')
        var postDataStr = JSON.stringify({
            "irRec": 1
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
                if ((typeof respuesta.irCodeH !== 'undefined') && (respuesta.irCodeH != "ffffffffffffffff")) {
                    resp.error = ""
                    resp.tipo = respuesta.irType
                    resp.codeHexa = respuesta.irCodeH
                    resp.codeDec = respuesta.irCodeD
                    return res.status(200).send(resp)
                } else {
                    resp.error = "X"
                    if (typeof respuesta === 'string') {
                        resp.mensaje = respuesta
                    } else if (respuesta.irCodeH == "ffffffffffffffff") {
                        resp.tipo = respuesta.irType
                        resp.codeHexa = respuesta.irCodeH
                        resp.codeDec = respuesta.irCodeD
                        resp.mensaje = "Codigo Invalido"
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
    })
}