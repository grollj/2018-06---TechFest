// grab the nerd model we just created
var Location = require('./models/locationObject');
var passport = require('passport');
var path = require('path');
var auth = require('./auth');

var mongoose = require('mongoose');
var RentModel = require('./models/rentNiveau');
var DatasetModel = require('./models/dataset');
var POIModel = require('./models/POI');
var FSModel = require('./models/FSCheckIns');
var Survey = require('./models/survey');
var User = require('./models/User');

var fb_setts = require('../config/fb');

var redirectTo = "";

module.exports = function(app) {

    // server route ===========================================================
    // handle things like api calls
    // authentication route

    // sample api route
    app.get('/api/locationObject', function(req, res) {
        // use mongoose to get all nerds in the database
        Location.find(function(err, locations) {

            // if there is an error retrieving, send the error.
            // nothing after res.send(err) will execute
            if (err)
                res.send(err);

            res.json(locations); // return all nerds in JSON format
        });
    });

    // route to handle creating goes here (app.post)
    // route to handle delete goes here (app.delete)

    // frontend route =========================================================
    // route to handle all angular requests
    app.get('/map', function (req, res) {
        res.sendFile(path.resolve(__dirname, '../public/views') + '/mapview.html');
    });

    app.get('/map/plugins', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(
            [
                {
                    name: 'Rents',
                    url: '/map/rentniveau'
                },
                {
                    name: 'Playgrounds',
                    url: '/map/playgrounds'
                },
                {
                    name: 'Bars',
                    url: '/map/bars'
                },
                {
                    name: 'Restaurants',
                    url: '/map/playgrounds'
                },
                {
                    name: 'Banks',
                    url: '/map/playgrounds'
                },
                {
                    name: 'Supermarkets',
                    url: '/map/playgrounds'
                },
                {
                    name: 'Cell coverage',
                    url: '/map/playgrounds'
                }
            ]
        ));
    });

    app.get('/map/rentniveau', function (req, res) {
        DatasetModel.findOne({url_csv: 'http://data.ub.uni-muenchen.de/2/1/miete03.asc'}, function (err, dataset) {
            var refId = dataset._id;
            RentModel.aggregate([
                { $match: { ods_ref_id: refId } },
                { $group: { _id: '$district', rent: { $avg: '$value' } } }
            ], function (err, data) {
                if(err) {
                    console.error(err);
                }

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(data));
            });
        });
    });

    function toGeoJSON(points) {
        var root = {
            "type": "FeatureCollection",
            "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } }
        };
        root.features = points.map(function (x) {
            var coords = x.latlong ? x.latlong : [x.latitude, x.longitude];
            return {
                type: 'Feature',
                properties: x.properties,
                geometry: { type: "Point", "coordinates": coords }
            }
        });
        return root;
    }

    app.get('/map/playgrounds', function (req, res) {
        DatasetModel.findOne({url_csv: 'https://www.opengov-muenchen.de/dataset/0760ce3a-fef8-43e4-888f-8cc92fdf56de/resource/845ce3bd-ea80-4623-b51d-a30680175c22/download/spielplaetzemuenchenohneleerespalten2016-06-13.csv'}, function (err, dataset) {
            var refId = dataset._id;
            POIModel.find({ ods_ref_id: refId }, function (err, data) {
                if(err) {
                    console.error(err);
                }

                data = data.map(function (x, idx, arr) {
                    return {
                        latlong: x.latlong(),
                        properties: {
                            name: x.value,
                            age: x.altersgruppe
                        }
                    }
                });

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(data));
            });
        });
    });

    app.get('/map/bars', function (req, res) {
        DatasetModel.findOne({name: 'Foursquare Checked-In Munich-Pruned'}, function (err, dataset) {
            var refId = dataset._id;
            FSModel.find({ ods_ref_id: refId}, function (err, data) {
                if(err) {
                    console.error(err);
                }

                data = data.map(function (x, idx, arr) {
                    return {
                        latlong: x.latlong(),
                        properties: {
                            name: x.value,
                            venue_type: x.venue_type
                        }
                    }
                });

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(data));
            });
        });
    });

    app.get('/dummy/pois', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(
            [
                {
                    latlong: [48.143673, 11.558043],
                    badge: 80
                },
                {
                    latlong: [48.139498, 11.566090],
                    match: 0.95
                },
                {
                    latlong: [48.201509, 11.608744]
                }
            ]
        ));
    });

    app.get('/', function(req, res) {
        res.render('index.hbs', {user: req.session.user});
    });

    app.use('/logout', auth.loginRequired);
    app.get('/logout', function (req, res) {
        req.session.user = undefined;
        res.redirect('/');
    });

    app.get('/auth/facebook',
    function(req, res, next) { redirectTo = ""; next()},
    passport.authenticate('facebook'));

    app.get('/auth/facebook/offer',
    function(req, res, next) { redirectTo = "#/offer"; next()},
    passport.authenticate('facebook'));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect: '/login',
            scope: ['public_profile', 'user_friends']
        }),
        function(req, res) {
            req.session.user = req.user;

            // Successful authentication, redirect home.
            updateProfile(req.session.user);
            res.redirect('/' + redirectTo);
        });


    app.get('/livestream', function(req, res) {
        res.render('lifestream.hbs', {user: req.session.user});
    });


    app.get('*', function(req, res) {
        res.redirect('/');
    });
};

var updateProfile = function(user) {
  var query = { fb_id: user.id }
  var update = {
    fb_id: user.id,
    display_name: user.displayName,
    first_name: user._json.first_name,
    last_name: user._json.last_name,
    gender: user.gender,
    pictureUrl: 'http://graph.facebook.com/' + user.id + '/picture?type=large'
  }

  User.findOneAndUpdate(query, update, {upsert:true, new:true}, function (err, dbuser) {
    if(err) {
      console.log(err);
    } else {
      // console.log(dbuser);
    }
  });
}
