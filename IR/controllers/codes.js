var mongoose = require('mongoose')
var IRCodes = mongoose.model('IRCodes')
var config = require("config")

exports.createCode = function(req, res) {
    var irCode = new IRCodes({
        nombre: req.body.nombre,
        grupo: req.body.grupo,
        descripcionGrupo: req.body.descripcionGrupo,
        descripcion: req.body.descripcion,
        tipo: req.body.tipo,
        codigoDec: req.body.codigoDec,
        codigoHex: req.body.codigoHex
    })
    irCode.save(function(err) {
        if (err) return res.status(500).send(err)
        return res.status(200).send(irCode)
    })
}

exports.updateCode = function(req, res) {
    var q = IRCodes.findById(req.params.id)
    q.exec(function(err, irCode) {
        if (err) return res.status(500).send(err)
        if (req.body.nombre) irCode.grupo = req.body.nombre
        if (req.body.grupo) irCode.grupo = req.body.grupo
        if (req.body.descripcionGrupo) irCode.descripcionGrupo = req.body.descripcionGrupo
        if (req.body.descripcion) irCode.descripcion = req.body.descripcion
        if (req.body.tipo) irCode.tipo = req.body.tipo
        if (req.body.codigoDec) irCode.codigoDec = req.body.codigoDec
        if (req.body.codigoHex) irCode.codigoHex = req.body.codigoHex
        irCode.save(function(err) {
            if (err) return res.status(500).send(err)
            return res.status(200).send(irCode)
        })
    })
}

exports.getCodes = function(req, res) {
    var q = IRCodes.find()
    q.exec(function(err, irCodes) {
        if (err) return res.status(500).send(err)
        return res.status(200).send(irCodes)
    })
}

exports.getCode = function(req, res) {
    var q = IRCodes.findById(req.params.id)
    q.exec(function(err, irCode) {
        if (err) return res.status(500).send(err)
        return res.status(200).send(irCode)
    })
}

exports.deleteCode = function(req, res) {
    IRCodes.remove({
        _id: req.params.id
    }, function(err) {
        if (err) return res.status(500).send(err)
        return res.status(200).send("OK")
    })
}