var passport = require('passport'),
    fs = require('fs'),
    _ = require('underscore');
    LocalStrategy = require('passport-local').Strategy,
    Users = require('../models/user');
    Items = require('../models/item');

module.exports = function (app) {

    // Home, Login & Logout
    app.get('/', ensureAuthenticated, app.controllers.home.splash, filterByConsigner);
    app.get('/login', app.controllers.home.login);
    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/login');
    });
    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/login' }),
        function(req, res) {
            res.redirect('/inventory');
        });

    //After successfully adding or updating an item. Displays success message and the isolated item
    app.get('/inventory/added/:id', ensureAuthenticated, app.controllers.home.inventoryAdded);
    app.get('/inventory/updated/:id', ensureAuthenticated, app.controllers.home.inventoryUpdated);

    //To quickly query by attribute
    app.get('/inventory/soldout', ensureAuthenticated, app.controllers.home.inventorySoldOut, filterByConsigner);
    app.get('/inventory/forsale', ensureAuthenticated, app.controllers.home.inventoryForSale, filterByConsigner);
    app.get('/inventory/oncart', ensureAuthenticated, app.controllers.home.inventoryOnCart, filterByConsigner);
    app.get('/inventory/onetsy', ensureAuthenticated, app.controllers.home.inventoryOnEtsy, filterByConsigner);
    app.get('/inventory/atsowa', ensureAuthenticated, app.controllers.home.inventoryAtSowa, filterByConsigner);

    //All inventory
    app.get('/inventory', ensureAuthenticated, app.controllers.home.inventory, filterByConsigner);

    //Others
    app.post('/inventory/query', ensureAuthenticated, app.controllers.home.inventoryQuery, filterByConsigner);
    app.post('/labels/generate', ensureAuthenticated, app.controllers.home.generateLabels);
    app.post('/file-upload', function(req, res) {
        // get the temporary location of the file
        var tmp_path = req.files.picture.path;
        // set where the file should actually exists - in this case it is in the "images" directory
        var target_path = '/home/dan/Workspace/Cart/app/public/img/itemImages/' + req.body.id;
        // move the file from the temporary location to the intended location
        fs.rename(tmp_path, target_path, function(err) {
            if (err) throw err;
            // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
            fs.unlink(tmp_path, function() {
                if (err) throw err;
                res.status(200);
                Items.find({_id: req.body.id}, function(err, items){
                    res.locals.items = items;
                    res.render('inventory')
                });
            });
        });
    });

    //Generic restful api for all models - if previous routes are not matched, will fall back to these
    //See libs/params.js, which adds param middleware to load & set req.Model based on :model argument
    app.get('/api/:model',ensureAdmin, app.controllers.api.search);
    app.post('/api/:model', ensureAuthenticated, app.controllers.api.create);
    app.get('/api/:model/:id', ensureAdmin, app.controllers.api.read);
    app.post('/api/item/sell/:id', ensureAdmin, app.controllers.api.sellItem);
    app.post('/api/item/:id', ensureAdmin, app.controllers.api.updateItem);
    app.post('/api/:model/:id', ensureAdmin, app.controllers.api.update);
    app.del('/api/:model/:id', ensureAdmin, app.controllers.api.destroy);

    //Middleware to make sure request is authenticated.
    //Redirects to login page, if not
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login')
    }

    //Middleware to ensure authenticated user is an admin
    function ensureAdmin(req, res, next) {
        if (req.user.admin) { return next(); }
        res.send('Cannot preform admin actions...');
    }

    //For users who are not admins, filter inventory items by user
    //so they can only see items they submitted.
    function filterByConsigner(req, res, next){
        if(!req.user.admin){
            //Not admin, filter inventory by logged in user
            filteredItems = _.filter(res.locals.items, function(item){
                return item.consigner.toLowerCase() === req.user.username.toLowerCase();
            });
            res.locals.items = filteredItems;
        }
        if(req.route.method == 'post'){
            return res.json(res.locals.items)
        }else{
            res.render('inventory');
        }

    }

    //Authentication strategy
    //TODO: Add in encryption
    passport.use(new LocalStrategy(
        function(username, password, done) {
            console.log("Username: " + username + " Password: " + password);
            Users.findOne({ username: username }, function (err, user) {
                console.log('Found user:' + user);
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (user.password != password) {
                    console.log(user.password + " " + password);
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        Users.findById(id, function (err, user) {
            done(err, user);
        });
    });

}
