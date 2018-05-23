exports = module.exports = function(mongoose) {
    var DHTValuesSchema = new mongoose.Schema({
        deviceID: { type: String },
        date: { type: Date },
        tipo: { type: String },
        valor: { type: Number }
    })
    mongoose.model('DHTValues', DHTValuesSchema)
}
