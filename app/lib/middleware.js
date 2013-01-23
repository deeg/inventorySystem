var express = require('express'),
    connect_timeout = require('connect-timeout'),
    MongoStore = require('connect-mongodb'),
    passport = require('passport');

// Middleware

module.exports = function (app) {

    // Sessions
    var mongoStore = new MongoStore({
        url:app.config.session.url
    });

    var session_middleware = express.session({
        key:app.config.session_key,
        store:mongoStore,
        maxAge:app.config.session_length
    });

    // Error handler
    var error_middleware = express.errorHandler({
        dumpExceptions:true,
        showStack:true
    });

    // Middleware stack for all requests
    app.use(express['static'](app.set('public')));                      // static files in /public
    app.use(connect_timeout({ time:app.constants.request_timeout }));   // request timeouts
    app.use(express.cookieParser(app.config.cookie_secret));            // req.cookies
    app.use(session_middleware);                                        // req.session
    app.use(express.bodyParser({uploadDir:'/home/dan/uploads'}));// req.body & req.files
    app.use(express.methodOverride());                                  // '_method' property in body (POST -> DELETE / PUT)
    app.use(require('strobe').flash);
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);                                                // routes in lib/routes.js

    // Handle errors thrown from middleware/routes
    app.use(error_middleware);
};