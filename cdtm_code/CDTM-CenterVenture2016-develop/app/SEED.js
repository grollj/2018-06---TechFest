var mongoose = require("mongoose");
var Survey = require("./models/survey.js")

var surveys = [
  {
    title: "PersonalitySurvey",
    sections: [
      {
        title: "Intro",
        description: "Please give us some information about yourself, so we can find your perfect flatmate.",
        number: 1,
        questions: [
          {
            title: "Firstname",
            question: "My Firstname",
            questionType: "TEXT",
            number: 1,
            answerOptions: null
          },
          {
            title: "Lastname",
            question: "My Lastname",
            questionType: "TEXT",
            number: 2,
            answerOptions: null
          },
          {
            title: "Birthday",
            question: "My Birthday",
            questionType: "DATE",
            number: 3,
            answerOptions: null
          },
          {
            title: "Gender",
            question: "My Gender",
            questionType: "CHOICE",
            number: 4,
            answerOptions: [
              {
                value: 0,
                text: "Female",
                iconUrl: "/img/icons/survey/female.png"
              },
              {
                value: 1,
                text: "Male",
                iconUrl: "/img/icons/survey/male.png"
              },
              {
                value: 2,
                text: "Other",
                iconUrl: "/img/icons/survey/unicorn.png"
              }
            ]
          },
          {
            title: "Occupation",
            question: "My Occupation",
            questionType: "TEXT",
            number: 5,
            answerOptions: null
          },
          {
            title: "About",
            question: "Tell us something about yourself:",
            questionType: "TEXT",
            number: 6,
            answerOptions: null
          }
        ]
      },
      {
        title: "Lifestyle",
        description: "We will use this information to calculate a matching score with your prospective roommates.",
        number: 2,
        questions: [
          {
            title: "Nightowl",
            question: "I am a nightowl ...",
            questionType: "CHOICE",
            number: 1,
            answerOptions: [
              {
                value: 1,
                text: "Early bird",
                iconUrl: "/img/icons/survey/bird.png"
              },
              {
                value: 2,
                text: "A bit of both",
                iconUrl: "/img/icons/survey/coffee.png"
              },
              {
                value: 3,
                text: "Nightowl",
                iconUrl: "/img/icons/survey/owl.png"
              }
            ]
          },
          {
            title: "Guests",
            question: "I often have guests ...",
            questionType: "CHOICE",
            number: 2,
            answerOptions: [
              {
                value: 1,
                text: "Hardly Ever"
              },
              {
                value: 2,
                text: "Once A Month"
              },
              {
                value: 3,
                text: "Once a week"
              },
              {
                value: 4,
                text: "Every Day"
              }
            ]
          },
          {
            title: "Party",
            question: "I like to party ...",
            questionType: "CHOICE",
            number: 3,
            answerOptions: [
              {
                value: 1,
                text: "not at all"
              },
              {
                value: 2,
                text: "sometimes"
              },
              {
                value: 3,
                text: "every weekend"
              },
              {
                value: 4,
                text: "during the week"
              },
              {
                value: 5,
                text: "day & night"
              }
            ]
          },
          {
            title: "Music",
            question: "I listen to music ...",
            questionType: "CHOICE",
            number: 4,
            answerOptions: [
              {
                value: 1,
                text: "with headphones"
              },
              {
                value: 2,
                text: "with low volume"
              },
              {
                value: 3,
                text: "with room volume"
              },
              {
                value: 4,
                text: "with loud volume"
              },
              {
                value: 5,
                text: "IT CANNOT BE LOUD ENOUGH"
              }
            ]
          },
          {
            title: "Smoke",
            question: "I smoke ...",
            questionType: "CHOICE",
            number: 5,
            answerOptions: [
              {
                value: 1,
                text: "No"
              },
              {
                value: 2,
                text: "No, but I don't mind"
              },
              {
                value: 3,
                text: "Yes"
              }
            ]
          },
          {
            title: "Vegitarian",
            question: "I am a ...",
            questionType: "CHOICE",
            number: 5,
            answerOptions: [
              {
                value: 1,
                text: "Vegan"
              },
              {
                value: 2,
                text: "Vegitarian"
              },
              {
                value: 3,
                text: "Pescitarian"
              },
              {
                value: 4,
                text: "Omnivore"
              }
            ]
          }
        ]
      },
      {
        title: "Living Together",
        description: "You and your potential flatling will see a percentage how your personalities and lifestyles fit together.",
        number: 3,
        questions: [
          {
            title: "Relationship",
            question: "My flatmate & I will ... ",
            questionType: "CHOICE",
            number: 1,
            answerOptions: [
              {
                value: 1,
                text: "Just share a house"
              },
              {
                value: 2,
                text: "have some common activities"
              },
              {
                value: 3,
                text: "be friends"
              },
              {
                value: 4,
                text: "become besties"
              },
              {
                value: 5,
                text: "be like family"
              }
            ]
          },
          {
            title: "Privacy",
            question: "Privacy means to me ... ",
            questionType: "CHOICE",
            number: 2,
            answerOptions: [
              {
                value: 1,
                text: "Mind your own business"
              },
              {
                value: 2,
                text: "Knock before you enter"
              },
              {
                value: 3,
                text: "My door is sometimes open"
              },
              {
                value: 4,
                text: "My door is mostly open"
              },
              {
                value: 5,
                text: "We can use the bathroom at the same time"
              }
            ]
          },
          {
            title: "Sharing",
            question: "Sharing is caring ... ",
            questionType: "CHOICE",
            number: 3,
            answerOptions: [
              {
                value: 1,
                text: "Don't touch my stuff"
              },
              {
                value: 2,
                text: "I will share in emergencies"
              },
              {
                value: 3,
                text: "If you ask nicely"
              },
              {
                value: 4,
                text: "Happy to share :-)"
              },
              {
                value: 5,
                text: "You can use everything"
              }
            ]
          },
          {
            title: "Kitchen",
            question: "This kitchen looks ... ",
            imageUrl: "/img/kitchen.jpg",
            questionType: "CHOICE",
            number: 4,
            answerOptions: [
              {
                value: 1,
                text: "Ewww. Disgusting"
              },
              {
                value: 2,
                text: "Too dirty for me"
              },
              {
                value: 3,
                text: "Just right for me"
              },
              {
                value: 4,
                text: "I would be happy if my place looked like that"
              },
              {
                value: 5,
                text: "Almost sterile - Like nobody lives there"
              }
            ]
          }
        ]
      },
      {
        title: "Yeah! Almost Done!",
        description: "We will treat your answers strictly confidential. We won't show them to anyone. Please indicate how much you agree with the following statements.",
        number: 4,
        questions: [
          {
            title: "Hardworking",
            question: "I am a hardworking person, who gets things done. ",
            questionType: "LIKERT",
            number: 1,
            answerOptions: [
              {
                value: 1,
                text: "Strongly Disagree"
              },
              {
                value: 2,
                text: "Disagree"
              },
              {
                value: 3,
                text: "Neutral"
              },
              {
                value: 4,
                text: "Agree"
              },
              {
                value: 5,
                text: "Strongly Agree"
              }
            ]
          },
          {
            title: "Tidy",
            question: "I keep my things tidy and clean. ",
            questionType: "LIKERT",
            number: 2,
            answerOptions: [
              {
                value: 1,
                text: "Strongly Disagree"
              },
              {
                value: 2,
                text: "Disagree"
              },
              {
                value: 3,
                text: "Neutral"
              },
              {
                value: 4,
                text: "Agree"
              },
              {
                value: 5,
                text: "Strongly Agree"
              }
            ]
          },
          {
            title: "Cold",
            question: "Some people think I am cold and calculating.",
            questionType: "LIKERT",
            number: 3,
            answerOptions: [
              {
                value: 1,
                text: "Strongly Disagree"
              },
              {
                value: 2,
                text: "Disagree"
              },
              {
                value: 3,
                text: "Neutral"
              },
              {
                value: 4,
                text: "Agree"
              },
              {
                value: 5,
                text: "Strongly Agree"
              }
            ]
          },
          {
            title: "Sensitive",
            question: "I always try to be sensitive and considerate.",
            questionType: "LIKERT",
            number: 4,
            answerOptions: [
              {
                value: 1,
                text: "Strongly Disagree"
              },
              {
                value: 2,
                text: "Disagree"
              },
              {
                value: 3,
                text: "Neutral"
              },
              {
                value: 4,
                text: "Agree"
              },
              {
                value: 5,
                text: "Strongly Agree"
              }
            ]
          },
          {
            title: "Helpless",
            question: "I often feel helpless and want someone else to solve my problems.",
            questionType: "LIKERT",
            number: 5,
            answerOptions: [
              {
                value: 1,
                text: "Strongly Disagree"
              },
              {
                value: 2,
                text: "Disagree"
              },
              {
                value: 3,
                text: "Neutral"
              },
              {
                value: 4,
                text: "Agree"
              },
              {
                value: 5,
                text: "Strongly Agree"
              }
            ]
          },
          {
            title: "Stressed",
            question: "I am often stressed and nervous.",
            questionType: "LIKERT",
            number: 6,
            answerOptions: [
              {
                value: 1,
                text: "Strongly Disagree"
              },
              {
                value: 2,
                text: "Disagree"
              },
              {
                value: 3,
                text: "Neutral"
              },
              {
                value: 4,
                text: "Agree"
              },
              {
                value: 5,
                text: "Strongly Agree"
              }
            ]
          },
          {
            title: "Literature",
            question: "When I read literature or look at art I sometimes get goosebumps or get really enthuastic.",
            questionType: "LIKERT",
            number: 7,
            answerOptions: [
              {
                value: 1,
                text: "Strongly Disagree"
              },
              {
                value: 2,
                text: "Disagree"
              },
              {
                value: 3,
                text: "Neutral"
              },
              {
                value: 4,
                text: "Agree"
              },
              {
                value: 5,
                text: "Strongly Agree"
              }
            ]
          },
          {
            title: "Bored",
            question: "I am bored by philosophical discussions.",
            questionType: "LIKERT",
            number: 8,
            answerOptions: [
              {
                value: 1,
                text: "Strongly Disagree"
              },
              {
                value: 2,
                text: "Disagree"
              },
              {
                value: 3,
                text: "Neutral"
              },
              {
                value: 4,
                text: "Agree"
              },
              {
                value: 5,
                text: "Strongly Agree"
              }
            ]
          },
          {
            title: "People",
            question: "I like being surrounded by many people.",
            questionType: "LIKERT",
            number: 9,
            answerOptions: [
              {
                value: 1,
                text: "Strongly Disagree"
              },
              {
                value: 2,
                text: "Disagree"
              },
              {
                value: 3,
                text: "Neutral"
              },
              {
                value: 4,
                text: "Agree"
              },
              {
                value: 5,
                text: "Strongly Agree"
              }
            ]
          },
          {
            title: "Cheerful",
            question: "I am a happy and cheerful person.",
            questionType: "LIKERT",
            number: 10,
            answerOptions: [
              {
                value: 1,
                text: "Strongly Disagree"
              },
              {
                value: 2,
                text: "Disagree"
              },
              {
                value: 3,
                text: "Neutral"
              },
              {
                value: 4,
                text: "Agree"
              },
              {
                value: 5,
                text: "Strongly Agree"
              }
            ]
          }
        ]
      }
    ]
  }
]

function seedDB() {
  // remove surveys
  Survey.remove({}, function(err){
      if(err){
          console.log(err)
      } else {
          console.log("Removed surveys!")
      }
  });

  // add surveys
  surveys.forEach(function(survey) {
    Survey.create(survey, function(err, dbsurvey){
            if(err){
                console.log(err);
            } else {
              // console.log(dbsurvey);
            }
    });
  });

}
module.exports = seedDB;
