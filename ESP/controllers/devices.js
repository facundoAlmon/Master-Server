var mongoose = require('mongoose')
var Devices = mongoose.model('ESPDevices')
var config = require("config")

exports.createDevice = function(req, res) {
    var device = new Devices({
        _id: req.body._id,
        descripcion: req.body.descripcion,
        host: req.body.host,
        puerto: req.body.puerto,
        modulos: req.body.modulos
    })
    device.save(function(err) {
        if (err) return res.status(500).send(err)
        return res.status(200).send(device)
    })
}

exports.updateDevice = function(req, res) {
    var q = Devices.findById(req.params.id)
    q.exec(function(err, device) {
        if (err) return res.status(500).send(err)
        if (req.body.descripcion) device.descripcion = req.body.descripcion
        if (req.body.host) device.host = req.body.host
        if (req.body.puerto) device.puerto = req.body.puerto
        if (req.body.modulos) device.modulos = req.body.modulos
        device.save(function(err) {
            if (err) return res.status(500).send(err)
            return res.status(200).send(device)
        })
    })
}

exports.getDevices = function(req, res) {
    var q = Devices.find()
    q.exec(function(err, devices) {
        if (err) return res.status(500).send(err)
        return res.status(200).send(devices)
    })
}

exports.getDevice = function(req, res) {
    var q = Devices.findById(req.params.id)
    q.exec(function(err, device) {
        if (err) return res.status(500).send(err)
        return res.status(200).send(device)
    })
}

exports.deleteDevice = function(req, res) {
    Devices.remove({
        _id: req.params.id
    }, function(err) {
        if (err) return res.status(500).send(err)
        return res.status(200).send("OK")
    })
}