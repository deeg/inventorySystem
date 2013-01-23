var hbs = require('express-hbs');

module.exports = function (app) {

    //set up view engine
    app.engine('hbs', hbs.express3({
        partialsDir:app.dir + "/views/partials"
    }));

    // expose error' and 'message' to all views that are rendered
    app.locals.use(function (req, res) {
        res.locals.environment = req.app.environment;
        res.locals.user = req.user || null;
    });

    // Static locals

    app.locals({
    });
};