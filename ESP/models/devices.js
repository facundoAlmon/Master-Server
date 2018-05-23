exports = module.exports = function(mongoose) {
    var devicesSchema = new mongoose.Schema({
        _id: { type: String },
        descripcion: { type: String },
        host: { type: String },
        puerto: { type: Number },
        modulos: [{
            type: String
        }]
    })
    mongoose.model('ESPDevices', devicesSchema)
};
