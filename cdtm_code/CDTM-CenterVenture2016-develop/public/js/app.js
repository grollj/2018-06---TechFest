/**
 * Created by cwoebker on 11.10.16.
 */
// app.js

// create the module and name it scotchApp
// also include ngRoute for all our routing needs
var cvApp = angular.module('cvApp', ['sticky', 'ngRoute', 'leaflet-directive', 'rzModule']);
var HOSTSTRING = ""

function shake(element) {
  try {
    element.classList.add('shake');
    element.classList.add('animated');
    setTimeout(function () {
      element.classList.remove('shake');
      element.classList.remove('animated');
    }, 1000);
  }
  catch(err) {
    // ignore
  }
}

cvApp.config(function($logProvider){
    $logProvider.debugEnabled(false);
});

// configure our route
cvApp.config(function($routeProvider) {
    $routeProvider

    // route for the home page
        .when('/', {
            templateUrl : '../views/index.html',
            controller  : 'mainController'
        })
        .when('/_=_', {
            templateUrl : '../views/index.html',
            controller  : 'mainController'
        })

        // route for the about page
        .when('/about', {
            templateUrl : '../views/about.html',
            controller  : 'aboutController'
        })

        // route for the about page
        .when('/matches', {
            templateUrl : '../views/matching.html',
            controller  : 'matchController'
        })

        // route for the contact page
        .when('/contact', {
            templateUrl : '../views/contact.html',
            controller  : 'contactController'
        })

        .when('/search/:city', {
            templateUrl: '../views/search.html',
            controller: 'searchController'
        })

        .when('/account', {
            templateUrl : '../views/account.html',
            controller  : 'accountController'
        })

        .when('/profile/:user_id', {
            templateUrl : '../views/profile.html',
            controller  : 'profileController'
        })

        .when('/offers', {
            templateUrl : '../views/offer_list.html',
            controller  : 'offerListController'
        })

        .when('/offer', {
            templateUrl : '../views/offer_create.html',
            controller  : 'offerCreateController'
        })

        .when('/offer/:offer_id', {
            templateUrl : '../views/offer_detail.html',
            controller  : 'offerDetailController'
        })

        .when('/rooms', {
            templateUrl : '../views/rooms.html',
            controller  : 'roomListController'
        })

        .when('/room/:room_id', {
            templateUrl : '../views/room.html',
            controller  : 'roomDetailController'
        })

        .when('/bookmarks', {
            templateUrl : '../views/bookmarks.html',
            controller  : 'bookmarksController'
        })

        .when('/messages', {
            templateUrl : '../views/messages.html',
            controller  : 'messagesController'
        })

        // route for the login page
        .when('/login', {
            templateUrl : '../views/login.html',
            controller  : 'loginController'
        })

        // route for the register page
        .when('/register', {
            templateUrl : '../views/register.html',
            controller  : 'registerController'
        });
});

cvApp.directive("personalityTest", function () {
   return {
      templateUrl: "/views/personalityTest.html",
      controller: "personalityTestController"
   };
});

cvApp.directive("matchCard", function () {
  return {
      scope: {
          match: '=' //Two-way data binding
      },
      templateUrl: '/views/matchCard.html',
      controller: function ($scope){
        $scope.Math = Math;
      }
  };
});

cvApp.directive("badge", function () {
  return {
      scope: {
          notifications: '=' //Two-way data binding
      },
      templateUrl: '/views/badge.html?2',
      controller: function ($scope){
        $scope.Math = Math;
      }
  };
});

cvApp.directive("offerPreview", function () {
   return {
      templateUrl: "/views/offerPreview.html",
      controller: "offerPreviewController"
   };
});


cvApp.directive("messageView", function () {
    return {
        templateUrl: "/views/messageView.html",
        controller: "messageViewController"
    };
});

// create the controller and inject Angular's $scope
cvApp.controller('mainController', function($scope, $location, $http, $window, $timeout) {
    // create a message to display in our view
    $scope.message = 'Everyone come and see how good I look!';
    $scope.notifications = 0;
    $scope.needsPersonalityTest = false;
    $scope.user = null;

    // globally available
    HOSTSTRING = "http://" + $location.host()+":"+$location.port()
      $http.get(HOSTSTRING + '/user')
           .then(
               function(response){
                 // success callback
                 $scope.user = response.data;
                 if ($scope.user != null && $scope.user != undefined && $scope.user != '') {
                   // user is logged in
                  //  console.log($scope.user);
                   if ($scope.user.personalityProfile == null || $scope.user.personalityProfile == undefined ){
                     $scope.needsPersonalityTest = true
                   }
                 }

                 $http.get(HOSTSTRING + '/pokes/to/' + $scope.user._id)
                      .then(
                          function(response){
                            // success callback
                            $scope.notifications = response.data.length;
                          },
                          function(response){
                            // failure callback
                            console.log(response.data);
                         }
                       );

               },
               function(response){
                 // failure callback
                 console.log(response.data);
              }
            );

      $scope.$watch('$routeUpdate', function(){
        if ($location.path() == '/_=_'){
          $location.path('');
        };
      });


    angular.element(document).ready(function () {
        $('.button-collapse').sideNav();
        $('.parallax').parallax();
        $('ul.tabs').tabs();
        $('select').material_select();

        var search = $('#main-search-bar');
        search.materialize_autocomplete({
            multiple: { enable: false },
            dropdown: { el: '#search-dropdown' },
            getData: function(value, callback) {
                Geocoder.search(value, function (data) {
                    var mapped = data.map(function (x, idx) {
                        return {
                            id: x.latlong,
                            text: x.long
                        }
                    });
                    callback(value, mapped);
                });
            }
        });
        search.on("change paste keyup input", function() {
            $scope.query = $(this).val();
            var id = $(this).data('value');
            if(id) {
                $window.location.href = '/#/search/['+ id + ']';
            }
        });
    });

    $scope.query = ''; // this should be the city
    $scope.commitSearch = function() {
        $window.location.href = '/#/search/'+$scope.query;
    };
});

function _getGeocoder(id) {
    var obj = {
        init: function (id) {
            L.mapbox.accessToken = 'pk.eyJ1IjoiYnJhbmRuZXJiIiwiYSI6ImNpdTQzYWZqNjAwMjQyeXFqOWR2a2tnZ2MifQ.LrcRwH1Vm-JsYR1zBb0Q9Q';
            this._geocoder = L.mapbox.geocoder(id || 'mapbox.places');
        },
        search: function(value, cb) {
            this._geocoder.query({
                query: value,
                proximity: [48.1345,11.571]
            }, function(err, res) {
                if(err) {
                    console.error(err);
                } else {
                    var results = res.results.features.map(function (x) {
                        return {
                            latlong: x.center.concat().reverse(),
                            long: x.place_name,
                            short: x.text
                        }
                    });
                    if(results.length > 0) {
                        cb(results);
                    }
                }
            });
        }
    };
    obj.init(id);
    return obj;
}

var Geocoder = _getGeocoder();

cvApp.controller('aboutController', function($scope) {
    $scope.message = 'Look! I am an about page.';
});

cvApp.controller('matchController', function($scope, $http, $timeout) {
    $scope.Math = Math;
    $scope.matches = null;

    $timeout(function() {
        $http.get(HOSTSTRING + '/user/matches')
             .then(
                 function(response){
                   // success callback
                   $timeout(function(){
                     $scope.matches = response.data;
                   },0);
                 },
                 function(response){
                   // TODO: Handle Error
                   // failure callback
                }
              );
    },0);


});

cvApp.controller('contactController', function($scope) {
    $scope.message = 'Contact us! JK. This is just a demo.';
});

cvApp.controller('personalityTestController', function($scope, $timeout, $http) {
  $scope.currentSection = 0;
  $scope.survey = null

  $scope.$watch('needsPersonalityTest', function() {
    if ($scope.needsPersonalityTest) {
      $scope.loadSurvey();
    }
 });

  $scope.loadSurvey = function() {
    $http.get(HOSTSTRING + '/user/personalitySurvey')
         .then(
             function(response){
               // success callback
               $scope.survey = response.data

               $scope.survey.sections[0].questions[0].answer = $scope.user.first_name;
               $scope.survey.sections[0].questions[1].answer = $scope.user.last_name;

               $timeout(initMaterialize, 0);
             },
             function(response){
               // TODO: Handle Error
               // failure callback
            }
          );
  }

  $scope.finishTest = function() {
    $scope.needsPersonalityTest = false;
  }

  $scope.nextSection = function() {
    // Sanity checking.
    var sane = true;
    $scope.survey.sections[$scope.currentSection - 1].questions.forEach(function(question) {
      sane = sane && question.answer != undefined  && question.answer != null;

      if (question.questionType=="TEXT") {
        sane = sane && question.answer != '';
      } else if (question.questionType=="CHOICE") {
        // TODO
      } else if (question.questionType=="LIKERT") {
        // TODO
      } else if (question.questionType=="DATE") {
      // TODO
    }
    });
    if (sane) {
      if ($scope.currentSection < $scope.survey.sections.length) {
        $scope.currentSection = $scope.currentSection + 1;
      } else {
        // TODO: Post to REST API.
        $http.post(HOSTSTRING + '/user/personalitySurvey', JSON.stringify($scope.survey))
         .then(
             function(response){
               // success callback
             },
             function(response){
               // failure callback
             }
          );
        $scope.finishTest()
      }
    } else {
      // TODO: visualize wrong input
      shake(document.getElementById('survey-form'));
    }
  }


  $timeout(initMaterialize, 0);

  function initMaterialize() {
    $(document).ready(function(){
      $('select').material_select();
      $('.materialboxed').materialbox();
      $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 60, // Creates a dropdown of 15 years to control year
        min: new Date(1960,1,1),
        max: new Date(new Date().getFullYear() - 16, new Date().getMonth(), new Date().getDate())
      });
    });
  }

});

cvApp.controller('offerPreviewController', ['$scope', '$timeout', '$http', '$route', function($scope, $timeout, $http, $route) {

  $timeout(initMaterialize, 0);

  function initMaterialize() {
    $(document).ready(function(){
      $('.slider').slider();
    });
  }

  $scope.room.createdAt = new Date($scope.room.createdAt).toLocaleDateString();

  $scope.room.pictures = [
    {
      img: '/img/room_indoor2.jpeg',
      description: "Spacious Kitchen",
    },
    {
      img: '/img/houses.jpg',
      description: "Quiet Neighbourhood",
    },
    {
      img: '/img/room_indoor1.jpeg',
      description: "German Style Dungeon",
    }
  ];

    $scope.submitBookmark = function() {
        // Posting data to php file
        $http({
            method  : 'POST',
            url     : '/bookmarks',
            data    : JSON.stringify({room: $scope.room._id}), //forms user object
            headers : {'Content-Type': 'application/json'}
        }).then(
            function(response){
                var $toastContent = $('<span class=\"center-align\">Bookmark Saved</span>');
                Materialize.toast($toastContent, 4000);
            },
            function(response){
                Materialize.toast('Error: Bookmark couldn\'t be updated!', 4000);
            }
        );
    };

    $scope.removeBookmark = function(bookmark_id) {
        // Posting data to php file
        $http({
            method  : 'DELETE',
            url     : '/bookmarks/' + bookmark_id,
            data    : JSON.stringify({}), //forms user object
            headers : {'Content-Type': 'application/json'}
        }).then(
            function(response){
                var $toastContent = $('<span class=\"center-align\">Bookmark Removed</span>');
                Materialize.toast($toastContent, 4000);
                $route.reload();
            },
            function(response){
                Materialize.toast('Error: Bookmark couldn\'t be updated!', 4000);
            }
        );
    };
}]);

cvApp.controller('searchController', function($scope, $routeParams, $http) {
  $('select').material_select();
  $(document).ready(function(){
    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });
    $('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
    //Price-Range
    $scope.price_slider = {
      minValue: 100,
      maxValue: 900,
      options:{
        floor:0,
        ceil:1000,
        step:1,
      }
    };

    //Room-Range
    $scope.room_slider = {
      minValue: 10,
      maxValue: 30,
      options:{
        floor:0,
        ceil:40,
        step:1,
      }
    };
    //Price-Range
    $scope.apartment_slider = {
      minValue: 10,
      maxValue: 135,
      options:{
        floor:0,
        ceil:150,
        step:1,
      }
    };

    angular.extend($scope, {
        formData: {
            startDate: null,
            checkbox_shortterm: false,
            enddate: null,
            university: '',
            checkbox_showown: true
        }
    });

    //travel-Range
    $scope.travel_slider = {
      minValue: 10,
      maxValue: 75,
      options:{
        floor:0,
        ceil:90,
        step:1,
      }
    };

  });
   $scope.city = $routeParams.city;
    console.log($scope.city);
    $scope.rooms = [];
    $http.get('/rooms').then(function (rooms) {
        $scope.oringinal_rooms = rooms.data;
        $scope.rooms = rooms.data;
        refilter();
    });

    $scope.$watch('formData.startDate', refilter);
    $scope.$watch('formData.checkbox_shortterm', refilter);
    $scope.$watch('formData.enddate', refilter);
    $scope.$watch('formData.university', refilter);
    $scope.$watch('formData.enddate', refilter);
    $scope.$watch('formData.enddate', refilter);
    $scope.$watch('price_slider.minValue', refilter);
    $scope.$watch('price_slider.maxValue', refilter);
    $scope.$watch('formData.checkbox_showown', refilter);
    // lookup the models in search.html ...

    function filterRoom(room) {
        // adapt here for real filtering
        // && $scope.filterblablabla
        var ownerid = room.owner ? room.owner._id : '';
        return room.price > $scope.price_slider.minValue
            && room.price < $scope.price_slider.maxValue
            && ($scope.user._id != ownerid || $scope.formData.checkbox_showown);
    }

    function refilter() {
        if(!$scope.oringinal_rooms || !$scope.oringinal_rooms.filter) {
            return;
        }
        $scope.rooms = $scope.oringinal_rooms.filter(filterRoom);
    }
});

cvApp.controller('accountController', function($scope) {
});

cvApp.controller('profileController', ['$scope', '$routeParams','$http', '$window', '$timeout', function($scope, $routeParams, $http, $window, $timeout) {
    $http.get('/user/profile/'+$routeParams.user_id)
        .then(function(response){
                $scope.profile = response.data;
                console.log($scope.profile)
            }
        );
    $http.get('/rooms/owner/'+$routeParams.user_id).
    then(function(response) {
        $scope.rooms = response.data;
    });

    $scope.submitPoke = function(profile_id) {
        // Posting data to php file
        $http({
            method  : 'Post',
            url     : '/pokes/' + profile_id,
            data    : JSON.stringify({}), //forms user object
            headers : {'Content-Type': 'application/json'}
        }).then(
            function(response){
                var $toastContent = $('<span class=\"center-align\">' + $scope.profile.display_name + ' has ben poked</span>');
                Materialize.toast($toastContent, 4000);
            },
            function(response){
                Materialize.toast('Error: User couldn\'t be poked!', 4000);
            }
        );
    };
}]);

cvApp.controller('bookmarksController', function($scope, $http) {
    $http.get('/bookmarks').
    then(function(response) {
        $scope.bookmarks = response.data;
    });
});

cvApp.controller('messagesController', function($scope, $http) {
    $(document).ready(function(){
        $('ul.tabs').tabs();
    });

    $http.get('/pokes/to/'+$scope.user._id).
    then(function(response) {
        $scope.pokes = response.data;
    });

});

cvApp.controller('messageViewController', function($scope, $timeout, $http) {

    $scope.submitMessage = function(to) {
        // Posting data to php file
        $scope.formData.to = to;
        $http({
            method  : 'POST',
            url     : '/messages',
            data    : JSON.stringify($scope.formData), //forms user object
            headers : {'Content-Type': 'application/json'}
        });
    };
});

cvApp.controller('offerCreateController', ['$scope', '$http', '$window', function($scope, $http, $window) {
    $scope.$watch('coordinates', console.log);

    angular.element(document).ready(function () {
        $('select').material_select();
        $('.datepicker').pickadate({
            selectMonths: true, // Creates a dropdown to control month
            selectYears: 15 // Creates a dropdown of 15 years to control year
        });
        $('input#input_text, textarea#comments').characterCounter();


        var search = $('#address');
        search.materialize_autocomplete({
            multiple: { enable: false },
            dropdown: { el: '#search-dropdown' },
            getData: function(value, callback) {
                Geocoder.search(value, function (data) {
                    var mapped = data.map(function (x, idx) {
                        return {
                            id: x.latlong,
                            text: x.long
                        }
                    });
                    // console.log("results:", mapped.map(function (x) {
                    //     return x.text;
                    // }));
                    callback(value, mapped);
                });
            }
        });
        search.on("change paste input", function() {
            var value = $scope.formData.address = $(this).val();
            var id = $(this).data('value');
            console.log("createoffersearch:", value, id);
            if(id) {
                var pos = JSON.parse('[' + id + ']');
                $scope.formData.coordinates = pos;
                // $scope.location = pos;
                $scope.pin = pos;
                $scope.$apply();
            }
        });
        //age_range-Range
        $scope.age_slider = {
          minValue: 10,
          maxValue: 75,
          options:{
            floor:0,
            ceil:90,
            step:1,
          }
      };

    });

    // create a blank object to handle form data.
    $scope.formData = {};
    // calling our submit function.
    $scope.submitForm = function() {
        console.log($scope.formData);
        $http({
            method  : 'POST',
            url     : '/rooms',
            data    : JSON.stringify($scope.formData), //forms user object
            headers : {'Content-Type': 'application/json'}
        })
            .success(function(data) {
                if (data.errors) {
                  // Showing errors.
                  $scope.errorName = data.errors.name;
                  $scope.errorUserName = data.errors.username;
                  $scope.errorEmail = data.errors.email;
                  Materialize.toast('Error: Room couldn\'t be saved!', 4000);
                  $window.location.href = '/#/offers/';
                } else {
                  $scope.message = data.message;
                  var $toastContent = $('<span class=\"center-align\">Room Saved!</span>');
                  Materialize.toast($toastContent, 4000);
                  $window.location.href = '/#/offer/'+data._id;
                }
            });
    };
}]);

cvApp.controller('offerDetailController', ['$scope', '$routeParams','$http', '$window', '$timeout', function($scope, $routeParams, $http, $window, $timeout) {
    $scope.matches = null;

    $http.get('/rooms/'+$routeParams.offer_id).
    then(function(response) {
        $scope.formData = response.data; // load data into the form Object
        search.val(response.data.address);
    });

    $timeout(function() {
        $http.get(HOSTSTRING + '/user/matches')
             .then(
                 function(response){
                   // success callback
                   $timeout(function(){
                     $scope.matches = response.data;
                   },0);
                 },
                 function(response){
                   console.log(response);
                   // TODO: Handle Error
                   // failure callback
                }
              );
    },0);

    angular.element(document).ready(function () {
        $('.slider').slider();
        $('select').material_select();
        $('.datepicker').pickadate({
            selectMonths: true, // Creates a dropdown to control month
            selectYears: 15 // Creates a dropdown of 15 years to control year
        });
        $(document).ready(function() {
            $('input#input_text, textarea#comments').characterCounter();
            $('label').addClass('active');
        });
    });
    var search = $('#address');
    search.materialize_autocomplete({
        multiple: { enable: false },
        dropdown: { el: '#search-dropdown' },
        getData: function(value, callback) {
            Geocoder.search(value, function (data) {
                var mapped = data.map(function (x, idx) {
                    return {
                        id: x.latlong,
                        text: x.long
                    }
                });
                // console.log("results:", mapped.map(function (x) {
                //     return x.text;
                // }));
                callback(value, mapped);
            });
        }
    });
    search.on("change paste input", function() {
        var value = $scope.formData.address = $(this).val();
        var id = $(this).data('value');
        console.log("createoffersearch:", value, id);
        if(id) {
            var pos = JSON.parse('[' + id + ']');
            $scope.formData.coordinates = pos;
            // $scope.location = pos;
            $scope.$apply();
        }
    });

    $scope.$watch('formData.coordinates', function (newVal) {
        $scope.pin = newVal;
    });

    // calling our submit function.
    $scope.submitForm = function() {
        // Posting data to php file
        $http({
            method  : 'PUT',
            url     : '/rooms/'+$routeParams.offer_id,
            data    : JSON.stringify($scope.formData), //forms user object
            headers : {'Content-Type': 'application/json'}
        })
            .success(function(data) {
                if (data.errors) {
                    // Showing errors.
                    $scope.errorName = data.errors.name;
                    $scope.errorUserName = data.errors.username;
                    $scope.errorEmail = data.errors.email;
                    Materialize.toast('Error: Room couldn\'t be updated!', 4000)
                } else {
                    $scope.message = data.message;
                  var $toastContent = $('<span class=\"center-align\">Room Updated!</span>');
                  Materialize.toast($toastContent, 4000)
                }
            });

        $window.location.href = '/#/offers';
    };
}]);

cvApp.controller('offerListController', function($scope, $http) {
    $http.get('/rooms/owner/'+$scope.user._id).
    then(function(response) {
        $scope.rooms = response.data;
    });
});


cvApp.controller('roomDetailController', ['$scope', '$routeParams','$http', '$window', '$timeout', function($scope, $routeParams, $http, $window, $timeout) {
    $timeout(initMaterialize, 0);

    function initMaterialize() {
      $(document).ready(function(){
        $('.slider').slider();
      });
    }

    $scope.$watch('coordinates', function (val) {
        $scope.pin = val;
    });

    $http.get('/rooms/'+$routeParams.room_id).
    then(function(response) {
        $scope.formData = response.data; // load data into the form Object
        console.log($scope.formData);

        $scope.formData.createdAt = new Date($scope.formData.createdAt).toUTCString();
        $scope.formData.pictures = [
                      {
                        img: '/img/wg-1.jpg',
                      },
                      {
                        img: '/img/wg-2.jpg',
                      },
                      {
                        img: '/img/wg-4.jpg',
                      },
                      {
                        img: '/img/wg-5.jpg',
                      }
                    ]

        $scope.formData.checkbox_living_room = true;
        $scope.formData.checkbox_furnitured = true;
        $scope.formData.checkbox_kitchen = true;
        $scope.formData.checkbox_washing_machine = true;
        $scope.formData.checkbox_barrier_free = true;
        $scope.formData.checkbox_pets = true;
        $scope.formData.checkbox_smoking = true;
        // $scope.formData.checkbox_balcony = true;
        // $scope.formData.checkbox_basement = true;
        // $scope.formData.checkbox_garden = true;
    });

    $scope.$watch('formData.coordinates', function (val) {
        $scope.pin = val;
    });


    // angular.element(document).ready(function () {
    // });


}]);

cvApp.controller('roomListController', function($scope, $http) {
    $http.get('/rooms').
    then(function(response) {
        $scope.rooms = response.data;
    });
});

cvApp.controller('loginController', function($scope) {
  $scope.message = 'Login Controller message thingy.';
});

cvApp.controller('registerController', function($scope) {
});


cvApp.directive('flatlingMap', function () {
    return {
        templateUrl: '/views/map.html',
        controller: "flatlingMapController",
        link: function(scope, element, attrs) {
            if(attrs.coordinates) {
                scope.location = attrs.coordinates;
            }
            if(attrs.toggleLeft) {
                scope.toggleLeft = attrs.toggleLeft;
            }
            scope.rooms = attrs.rooms;
        }
    }
});


cvApp.controller("flatlingMapController",  [ '$scope', '$http', '$location', 'leafletData', function($scope, $http, $location, leafletData) {
    angular.extend($scope, {
        center: {
            lat: 48.143763,
            lng: 11.557979,
            zoom: 9
        },
        defaults: {
            scrollWheelZoom: false
        },
        tiles: {
            url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYnJhbmRuZXJiIiwiYSI6ImNpdTQzYWZqNjAwMjQyeXFqOWR2a2tnZ2MifQ.LrcRwH1Vm-JsYR1zBb0Q9Q',
            options: {
                maxZoom: 18,
                attribution: '',
                id: 'mapbox.streets'
            }
        }
    });

    angular.element(document).ready(function () {
        // $('.sidebar').hide();
    });

    var toggle = function () {
        console.log('toggeling');
        var sidebar = $('.sidebar');
        var invisible = sidebar.is(':hidden');
        if(invisible) {
            sidebar.fadeIn();
        } else {
            sidebar.fadeOut();
        }
        setTimeout(function(){ map.invalidateSize()}, 500);
    };

    function onLocation(newValue, oldValue) {
        // try to parse json:
        console.log('try set location', newValue);
        if(typeof(newValue) == 'string') {
            try {
                var json = JSON.parse(newValue);
                if(json.length == 2 && typeof (json[0]) == 'number' && typeof (json[1]) == 'number') {
                    newValue = json;
                }
            } catch (e) {
            }
        }

        if(newValue) {
            if(newValue.length == 2) {
                moveTo(newValue);
                console.log('set location', newValue);
                return true;
            } else if(typeof (newValue) == 'string') {
                // todo geolocator api
                // return true;
            }
        }

        return false;
    }

    var pin = null;
    function pinAt(newValue, oldVal) {
        if(typeof(newValue) == 'string') {
            try {
                var json = JSON.parse(newValue);
                if(json.length == 2 && typeof (json[0]) == 'number' && typeof (json[1]) == 'number') {
                    newValue = json;
                }
            } catch (e) {
            }
        }

        if(newValue) {
            if(newValue.length == 2) {
                if(pin == null) {
                    pin = L.marker(newValue, {
                        draggable: true
                    }).addTo(map);
                } else {
                    pin.setLatLng(newValue);
                }
                moveTo(newValue, 15); // center marker
                console.log('set markers', newValue);
                return true;
            } else if(typeof (newValue) == 'string') {
                // todo geolocator api
                // return true;
            }
        }

        return false;
    }

    $scope.$watch("location", onLocation);
    $scope.$watch('pin', pinAt);
    var roomsLayer = null;
    $scope.$watch('rooms', function (newrooms, oldrooms) {
        console.log('rooms:', oldrooms, '->', newrooms);
        // make geojson
        var geojson = {
            type: 'FeatureCollection'
        };

        function makeFeature(room) {
            var own = room.owner && room.owner._id == $scope.user._id;
            var feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": room.coordinates.concat().reverse()
                },
                "properties": {
                    "title": room.price + '€ / ' + room.size_room + 'qm',
                    "description": room.address,
                    url: '/room/' + room._id
                }
            };
            feature.properties['marker-color'] = own ? '#3e69e8' : "#fc4353";
            feature.properties['marker-size'] = own ? 'medium' : "large";
            feature.properties['marker-symbol'] = own ? '' : Math.min(99, Math.round(room.score * 100) || 0);
            return feature;
        }

        if(!newrooms) {
            return;
        }

        geojson.features = newrooms.map(makeFeature);
        if(!roomsLayer) {
            roomsLayer = L.mapbox.featureLayer(geojson, {
                pointToLayer: function (feature, latlang) {
                    var marker = L.mapbox.marker.style(feature, latlang);
                    return marker;
                }
            }).addTo(map);
            roomsLayer.on('mouseover', function(e) {
                e.layer.openPopup();
            });
            roomsLayer.on('mouseout', function(e) {
                e.layer.closePopup();
            });
            roomsLayer.on('click', function(e) {
                $location.path(e.layer.feature.properties.url);
            });
        }
        roomsLayer.setGeoJSON(geojson);
    });

    var deferredCoords = null;
    function moveTo(coordinates, zoom) {
        console.log("move to", coordinates, zoom);
        if(map == null) {
            deferredCoords = coordinates;
            console.log('deferred');
        } else {
            map.setView(coordinates, zoom || 12, {animate: true});
        }
    }

    $http.get('/map/plugins').then(function(resp) {
        $scope.datasets = resp.data;
        setTimeout(function () {
            var thing = $('.leaflet-top.leaflet-right>.leaflet-control');
            shake(thing[1]);
        }, 2000);
    });
    $scope.datasetClicked = function (dataset) {
        // console.log('datasetclicked', dataset);
        var datasetId = dataset.name;
        var actions = {
            'Districts': loadDistricts,
            'Test': loadUrl.bind(undefined, dataset.url, markers),
            'Rents': loadUrl.bind(undefined, dataset.url, rent),
            'Playgrounds': loadUrl.bind(undefined, dataset.url, cluster),
            'Bars': loadUrl.bind(undefined, dataset.url, heatmap)
        };

        if(!(datasetId in actions)) {
            console.error('dataset ' + datasetId + ' has no action!');
        } else {
            actions[datasetId](dataset.checked);
        }
    };

    var ToggleLayers = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function (map) {
            var html = '<div class="leaflet-control-layers leaflet-control"><a class="leaflet-control-layers-toggle" href="javascript:void(0)"></a></div>';
            elem = $(html).click(toggle);
            return elem[0];
        }
    });

    var ToggleLeft = L.Control.extend({
        options: {
            position: 'topleft'
        },

        onAdd: function (map) {
            var html = '<div class="leaflet-control-layers leaflet-control customicon"><i class="material-icons">reorder</i></div>';
            elem = $(html).click(toggleLeft);
            return elem[0];
        }
    });

    var toggleLeft = function () {
        var item = $($scope.toggleLeft);
        var invisible = item.is(':hidden');
        if(invisible) {
            item.fadeIn();
        } else {
            item.fadeOut();
        }
        setTimeout(function(){ map.invalidateSize()}, 500);
    };

    var map = null;
    leafletData.getMap('map').then(function (res) {
        map = window.map = res;
        map.addControl(new ToggleLayers());
        if($scope.toggleLeft) {
            map.addControl(new ToggleLeft());
        }

        if(deferredCoords) {
            map.setView(deferredCoords, 11, {animate: true});
        } else {
            if(onLocation($scope.location, $scope.location)) {
                // already moving
            } else {
                setTimeout(function () {
                    if(!$scope.pin) {
                        console.log('deferred zoom');
                        map.setZoom(11, {animate: true});
                    }
                }, 1000);
            }
        }
    });
    var layers = {};

    function loadDistricts(load) {
        if(load) {
            var customLayer = L.geoJson(null, {
                // http://leafletjs.com/reference.html#geojson-style
                onEachFeature: function (feature, layer) {
                    var getCentroid2 = function (arr) {
                        var twoTimesSignedArea = 0;
                        var cxTimes6SignedArea = 0;
                        var cyTimes6SignedArea = 0;

                        var length = arr.length;

                        var x = function (i) { return arr[i % length][1] };
                        var y = function (i) { return arr[i % length][0] };

                        for ( var i = 0; i < arr.length; i++) {
                            var twoSA = x(i)*y(i+1) - x(i+1)*y(i);
                            twoTimesSignedArea += twoSA;
                            cxTimes6SignedArea += (x(i) + x(i+1)) * twoSA;
                            cyTimes6SignedArea += (y(i) + y(i+1)) * twoSA;
                        }
                        var sixSignedArea = 3 * twoTimesSignedArea;
                        return [ cxTimes6SignedArea / sixSignedArea, cyTimes6SignedArea / sixSignedArea];
                    };
                    var getTop = function (arr) {
                        // get highest latitude = northest point
                        var maxL, index = null;
                        arr.forEach(function (elem, idx) {
                            if(!index || elem[1] > maxL) {
                                maxL = elem[1];
                                index = idx;
                            }
                        });

                        var swapped = arr[index];
                        return [swapped[1], swapped[0]];
                    };

                    var popup = L.popup()
                        .setContent('<p class="nomouse">' + feature.properties.description + " " + feature.properties.name + '</p>');
                    layer.on('mouseover', function(e) {
                        var coords = getTop(feature.geometry.coordinates[0]);
                        // console.log(coords);
                        popup.d_id = feature.properties.description;
                        popup.setLatLng(coords).openOn(map);
                    });
                    layer.on('mouseout', function(e) {
                        function inside(x, y, rect) {
                            return ((x <= rect.right) && (x >= rect.left) && (y <= rect.bottom) && (y >= rect.top));
                        }
                        // if(popup.d_id == feature.properties.description &&
                        //     inside(e.originalEvent.pageX, e.originalEvent.pageY, popup._container.getBoundingClientRect())) {
                        //     return;
                        // }
                        map.closePopup(popup);
                    });
                }
            });

            var layer = omnivore.kml('/maps/public/munich-districts.kml', null, customLayer);
            layers['districts'] = layer;
            layer.addTo(map);
        } else {
            map.removeLayer(layers['districts']);
            layers['districts'] = undefined;
        }
    }

    var data = [];
    // load & cache (or hide) a resource and visualize with callback then(data)
    function loadUrl(url, then, load) { // then: function(data)
        var existing = data.filter(function (element, index, array) {
            return element.srcUrl == url;
        });
        if(load) {
            if(existing.length > 0) {
                existing[0].layer = then(existing[0].data);
            } else {
                // download fresh
                $http.get(url).then(function (response) {
                    data.push({
                        srcUrl: url,
                        data: response.data,
                        layer: then(response.data)
                    });
                });
            }
        } else {
            var layer = existing[0].layer;
            map.removeLayer(layer);
            existing[0].layer = undefined;
        }
    }

    function cluster(data) {
        var layer = new L.MarkerClusterGroup({
            animateAddingMarkers: true,
            disableClusteringAtZoom: 14
        });

        for (var i = 0; i < data.length; i++) {
            var latlong = data[i].latlong;
            var title = data[i].properties.name;
            var marker = L.marker(new L.LatLng(latlong[0], latlong[1]), {
                icon: L.mapbox.marker.icon({'marker-symbol': 'playground', 'marker-color': '0044FF'}),
                title: title
            });
            marker.bindPopup(title);
            layer.addLayer(marker);
        }

        map.addLayer(layer);
        return layer;
    }

    function heatmap(data) {
        var layer = new L.heatLayer([], { maxZoom: 18, radius: 30, blur: 30, max: 0.95 })

        data.forEach( function(element, index) {
          layer.addLatLng(element.latlong);
          // statements
        });

        map.addLayer(layer);
        return layer;
    }

    function markers(data) {
        var layer = L.layerGroup().addTo(map);
        data.forEach(function (val, idx, arr) {
            var tooltip = val.badge ? (val.badge) : val.match ? (((val.match * 100) % 100) + '%') : '';
            var badge = '<div class="marker-badge"><span class="standalone no-wrap">' + tooltip + '</span></div>';
            var html = (tooltip ? badge : '') + '<img class="marker-img" src="https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon-2x.png" style="bottom:' + (tooltip ? 11 : 0) + 'px;"/>';
            var marker = L.marker(val.latlong, {
                riseOnHover: true,
                icon: L.divIcon({
                    className: 'label autosize-label marker',
                    html: html,
                    iconSize: [30, tooltip ? 60 : 41],
                    iconAnchor: [15, tooltip ? 60 : 41]
                })
            });
            if(val.popup) {
                marker.bindPopup(val.popup);
            }
            marker.addTo(layer);
        });
        return layer;
    }

    function rent(data) {
        return coloredArea(data, '€');
    }

    function coloredArea(data, suffix) {
        // we expect data to be an array of { district: <id>, value: <v>  ... } objects, then pull in
        // district kml and color features based on values
        var values = data.map(function (x) {
            return x.rent;
        });
        var max = Math.max.apply(null, values);
        var min = Math.min.apply(null, values);

        function color(value) {
            var normalized = (value - min) / (max - min);
            var colors = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026' ];
            var idx = Math.round(normalized * colors.length);
            return colors[Math.max(0, Math.min(colors.length - 1, idx))];
        }

        var valueMap = {};
        data.forEach(function (x, idx, arr) {
            valueMap[x._id] = x.rent;
        });

        // pull districts (stolen from loadDistricts())
        var customLayer = L.geoJson(null, {
            // http://leafletjs.com/reference.html#geojson-style
            onEachFeature: function (feature, layer) {
                var value = valueMap[parseInt(feature.properties.description)];
                var formatted = Math.round(value);
                layer.bindPopup(feature.properties.name + ': <strong>' + formatted + suffix + '</strong>');
            },
            style: function (feature) {
                var value = valueMap[parseInt(feature.properties.description)];
                return {
                    weight: 2,
                    opacity: 0.7,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.5,
                    fillColor: color(value)
                };
            }
        });

        return omnivore.kml('/maps/public/munich-districts.kml', null, customLayer).addTo(map);
    }

    // return {
    //     scope: {
    //         location: '=coordinates'
    //     }
    // };
}]);
