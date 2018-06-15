var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: String,
    url_csv:  String
}, { collection : 'open_datasets' });

module.exports = mongoose.model('Dataset', schema);
