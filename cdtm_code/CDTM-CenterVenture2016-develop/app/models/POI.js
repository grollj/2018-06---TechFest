var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    longitude: Number,
    latitude:  Number,
    value: String,
    altersgruppe: String,
    ods_ref_id: Schema.Types.ObjectId
}, { collection : 'open_datasets_data' });
schema.methods.latlong = function () {
    return [this.latitude, this.longitude];
};

module.exports = mongoose.model('POI', schema);
