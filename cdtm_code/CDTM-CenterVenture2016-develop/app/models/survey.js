// A generic survey model
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    title: {type: String},
    sections: [
        {
          title: {type: String},
          description: {type: String},
          number: Number,
          questions: [
            {
              title: {type: String},
              question: {type: String},
              number: Number,
              imageUrl: String,
              questionType: {
                type: String,
                number: Number,
                enum : ['TEXT','CHOICE', 'LIKERT', 'DATE'],
              },
              answerOptions: [
                {
                  value: {type: Number},
                  text: {type: String},
                  iconUrl: {type: String}
                }
              ]
            }
          ]
        }
      ]
});

module.exports = mongoose.model('Survey', schema);
