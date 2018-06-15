/**
 * Created by cwoebker on 12.10.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./User');

var picture = new mongoose.Schema({
    img: {type : String, default: ''},
    description: {type : String, default: ''},
});

var schema = new mongoose.Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    address: {type: String, default: ''},
    price: {type: Number, default: 0},
    coordinates: {type: [Number], default: [] },
    deposit: {type: Number, default: 0},
    size_room: {type: Number, default: 0},
    size_apartment: {type: Number, default: 0},
    room_type: {type: String, default: ''},
    start_date: {type: String, default: ''},
    end_date: {type: String, default: ''},
    checkbox_shortterm: {type: Boolean, default: false},
    checkbox_furnitured: {type: Boolean, default: false},
    checkbox_kitchen: {type: Boolean, default: false},
    checkbox_washing_machine: {type: Boolean, default: false},
    checkbox_barrier_free: {type: Boolean, default: false},
    checkbox_pets: {type: Boolean, default: false},
    checkbox_smoking: {type: Boolean, default: false},
    checkbox_balcony: {type: Boolean, default: false},
    checkbox_garden: {type: Boolean, default: false},
    checkbox_living_room: {type: Boolean, default: false},
    checkbox_basement: {type: Boolean, default: false},
    nr_of_male_roomates: {type: Number, default: 0},
    nr_of_female_roomates: {type: Number, default: 0},
    nr_of_other_roomates: {type: Number, default: 0},
    comments: {type: String, default: ''},
    pictures: [ picture ]
},
{
    timestamps: true
});

// define our nerd model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Room', schema);
