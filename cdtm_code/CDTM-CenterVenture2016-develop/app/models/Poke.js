/**
 * Created by cwoebker on 14.10.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./User');

var schema = new mongoose.Schema({
        from: { type: Schema.Types.ObjectId, ref: 'User' },
        to: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('Poke', schema);
