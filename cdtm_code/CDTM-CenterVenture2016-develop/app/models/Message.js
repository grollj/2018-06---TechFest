/**
 * Created by cwoebker on 14.10.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./User');

var schema = new mongoose.Schema({
        from: { type: Schema.Types.ObjectId, ref: 'User' },
        to: { type: Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, default: '' },
        inbox: { type: Boolean, default: false }
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('Message', schema);
