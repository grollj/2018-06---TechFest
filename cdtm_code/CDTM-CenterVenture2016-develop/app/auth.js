/**
 * Created by cwoebker on 12.10.16.
 */

var User = require('./models/User');

function userMiddleware(req, res, next) {
    if (req.session.user) {
        next();
        return;
    }
    res.redirect('/');
}

function apiMiddleware(req, res, next) {
    if (req.session.user) {
        console.log("API Auth Request " + req.originalUrl + " from: " + JSON.stringify(req.session.user.displayName));
        User.findOne({fb_id: req.session.user.id}, function (err, user) {
            if(err) {
                res.status(500).send(
                    JSON.stringify({
                        status: 500,
                        description: 'Internal Server Error'
                    })
                );
            } else {
                req.session.dbuser = user;
            }
        });
        next();
        return;
    }
    res.status(401).send('not authorized');
}

module.exports = {
    "loginRequired": userMiddleware,
    "sessionRequired": apiMiddleware,
};
