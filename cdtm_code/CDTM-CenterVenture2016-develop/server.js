// server.js

// modules =================================================
var express          = require('express');
var app              = express();
var bodyParser       = require('body-parser');
var methodOverride   = require('method-override');
var mongoose         = require('mongoose');
var passport         = require('passport');
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var session          = require('express-session');
var expressHbs       = require('express-handlebars');

// sub aps ===============================
var user = require('./app/route/user');
var rooms = require('./app/route/rooms');
var bookmarks = require('./app/route/bookmarks');
var messages = require('./app/route/messages');
var pokes = require('./app/route/pokes');

// configuration ===========================================
var db_setts = require('./config/db');
var fb_setts = require('./config/fb');

var port = process.env.PORT || 1337;

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new FacebookStrategy({
        clientID: "1072223219560634",
        clientSecret: "7f957acd6b1360bb73460fd8e36b0557",
        callbackURL: fb_setts.url,
        profileFields: ['id', 'displayName', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'picture']
    },
    function(accessToken, refreshToken, profile, cb) {
        // In this example, the user's Facebook profile is supplied as the user
        // record.  In a production-quality application, the Facebook profile should
        // be associated with a user record in the application's database, which
        // allows for account linking and authentication with other identity
        // providers.
        // console.log(profile);
        return cb(null, profile);
    }));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

// view engine
app.engine('hbs', expressHbs({
    extname:'hbs',
    defaultLayout:'base.hbs',
    helpers: { }
}));
app.set('view engine', 'hbs');

// connect to our mongoDB database
// (uncomment after you enter in your own credentials in config/db.js)
mongoose.connect(db_setts.url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    // console.log('db open', db);
});

app.mongo = db;

// SEED DB

var seedDB = require('./app/SEED');
seedDB();

// get all data/stuff of the body (POST) parameters
// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));


// static map content
app.use('/maps/public', express.static(__dirname + '/data/public'));

app.use(passport.initialize());
app.use(passport.session());

// session cookies
var oursession = session({
    //store: new FileStore(),
    secret: 'super_secret_lol',
    saveUninitialized: true,
    resave: true,
    cookie: {
        maxAge: 24 * 3600 * 1000
    }
});

app.use(oursession);

// later for auth with socket.io
// iom.attach(server, oursession, auth);

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// route ==================================================
app.use('/rooms', rooms);
app.use('/user', user);
app.use('/bookmarks', bookmarks);
app.use('/messsages', messages);
app.use('/pokes', pokes);

require('./app/routes')(app); // configure our route

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);

// shoutout to the user
console.log('Magic happens on port ' + port);

// expose app
exports = module.exports = app;
