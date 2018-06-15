// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name : {type : String, default: ''},
    description: {type : String, default: ''},
    url_csv: {type : String, default: ''},
    loc_type: {type : String, default: ''}, // either coord, district, or?
    data_type: {type: String, default: ''},
	author: {type : String, default: ''},
	author_email: {type : String, default: ''},
	license_id: {type : String, default: ''},
	license_title: {type : String, default: ''},
	license_url: {type : String, default: ''},
	maintainer: {type : String, default: ''},
	maintainer_email: {type : String, default: ''},
	metadata_created: {type : String, default: ''},
	metadata_modified: {type : String, default: ''},
	image: {type : String, default: ''},
	data: [{
		        // text: String,
		        location: {
	                latitude: {type : Number},
				    longitude: {type : Number},
				    district: {type : Number},
		        }
	    }]
});

// define our nerd model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('LocationObject', schema);
