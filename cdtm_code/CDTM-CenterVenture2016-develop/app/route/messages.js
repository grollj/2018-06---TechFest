/**
 * Created by cwoebker on 14.10.16.
 */

var express = require('express');
var router = express.Router();
var auth = require('../auth');

var mongoose = require('mongoose');
var User = require('../models/User');
var Message = require('../models/Message');

/* GET /rooms listing. */
router.use('/', auth.sessionRequired);
router.get('/', function(req, res, next) {
    Message.find().populate('from').populate('to').exec(function (err, messages) {
        if (err) return next(err);
        res.json(messages);
    });
});

/* POST /rooms */
router.use('/', auth.sessionRequired);
router.post('/', function(req, res, next) {
    req.body.from = req.session.dbuser._id;
    Message.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /rooms/id */
router.use('/:message_id', auth.sessionRequired);
router.get('/:message_id', function(req, res, next) {
    Message.findById(req.params.message_id, function (err, message) {
        if (err) return next(err);
        res.json(message);
    });
});

module.exports = router;