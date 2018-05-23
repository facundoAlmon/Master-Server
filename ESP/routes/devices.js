var express = require("express")
var DeviceCtrl = require('../controllers/devices.js')
var Device = express.Router()

Device.post("/", DeviceCtrl.createDevice)
Device.get("/", DeviceCtrl.getDevices)
Device.get("/:id", DeviceCtrl.getDevice)
Device.put("/:id", DeviceCtrl.updateDevice)
Device.delete("/:id", DeviceCtrl.deleteDevice)

module.exports = Device