/**
 * Created by cwoebker on 14.10.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./User');
require('./Room');

var schema = new mongoose.Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    room: { type: Schema.Types.ObjectId, ref: 'Room' },
},
{
    timestamps: true
});

module.exports = mongoose.model('Bookmark', schema);
