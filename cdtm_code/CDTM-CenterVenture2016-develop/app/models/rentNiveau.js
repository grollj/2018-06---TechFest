var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    district: Number,
    value:  Number,
    ods_ref_id: Schema.Types.ObjectId
}, { collection : 'open_datasets_data' });

module.exports = mongoose.model('RentNiveau', schema);
