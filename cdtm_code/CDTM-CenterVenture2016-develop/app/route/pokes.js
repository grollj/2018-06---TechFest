/**
 * Created by cwoebker on 14.10.16.
 */

var express = require('express');
var router = express.Router();
var auth = require('../auth');

var mongoose = require('mongoose');
var User = require('../models/User');
var Poke = require('../models/Poke');

/* GET /rooms listing. */
router.use('/', auth.sessionRequired);
router.get('/', function(req, res, next) {
    Poke.find().populate('from').populate('to').exec(function (err, pokes) {
        if (err) return next(err);
        res.json(pokes);
    });
});

/* GET /rooms/id */
router.use('/to/:user_id', auth.sessionRequired);
router.get('/to/:user_id', function(req, res, next) {
    Poke.find({to: req.params.user_id}).populate('from').exec(function (err, pokes) {
        if (err) return next(err);
        res.json(pokes);
    });
});

/* POST /rooms */
router.use('/:profile_id', auth.sessionRequired);
router.post('/:profile_id', function(req, res, next) {
    req.body.from = req.session.dbuser._id;
    req.body.to = req.params.profile_id;
    Poke.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /rooms/id */
router.use('/:poke_id', auth.sessionRequired);
router.get('/:poke_id', function(req, res, next) {
    Poke.findById(req.params.room_id, function (err, poke) {
        if (err) return next(err);
        res.json(poke);
    });
});

module.exports = router;