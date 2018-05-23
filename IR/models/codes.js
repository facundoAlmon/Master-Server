exports = module.exports = function(mongoose) {
    var codesSchema = new mongoose.Schema({
    	nombre: { type: String },
        grupo: { type: String },
        descripcionGrupo: { type: String },
        descripcion: { type: String },
        tipo: { type: String },
        codigoDec: { type: String },
        codigoHex: { type: String }

    });
    mongoose.model('IRCodes', codesSchema);
};
