var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    fb_id : {type: String},
    display_name : {type : String},
    first_name : {type : String},
    last_name : {type : String},
    about : {type : String},
    gender: {type : String},
    pictureUrl: {type : String},
    personalityProfile: {
      default: null,
      type: {
        firstname : {type : String},
        lastname : {type : String},
        birthday : {type : Date},
        gender : {type : String},
        occupation: {type : String},
        values: [
          {
            title: {type: String},
            value: {type: Number},
            weight: {type: Number},
            min: {type: Number},
            max: {type: Number}
          }
        ]
      }
    }

});

// define our nerd model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('User', schema);
