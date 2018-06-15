/**
 * Created by cwoebker on 14.10.16.
 */

var express = require('express');
var router = express.Router();
var auth = require('../auth');
var helpers = require('../helpers');
var calculatePersonalityMatching = helpers.calculatePersonalityMatching;

var mongoose = require('mongoose');
var Room = require('../models/Room');
var User = require('../models/User');
var Bookmark = require('../models/Bookmark');

router.use('/', auth.sessionRequired);
router.get('/', function(req, res, next) {
    Bookmark.find({owner: req.session.dbuser._id}).populate({
        path: 'room',
        model: 'Room',
        populate: {
            path: 'owner',
            model: 'User'
        }
    }).exec(function (err, bookmarks) {
        if (err) return next(err);
        var results = [];
        var i;
        for (i = 0; i < bookmarks.length; ++i) {
            results.push(bookmarks[i].toObject());
            var score = calculatePersonalityMatching(req.session.dbuser, results[i].room.owner);
            results[i].room.score = score;
        }
        res.json(results);
    });
});

router.use('/', auth.sessionRequired);
router.post('/', function(req, res, next) {
    req.body.owner = req.session.dbuser._id;
    Bookmark.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

router.use('/:bookmark_id', auth.sessionRequired);
router.delete('/:bookmark_id', function(req, res, next) {
    Bookmark.findOneAndRemove({_id: req.params.bookmark_id, owner: req.session.dbuser._id}, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

module.exports = router;