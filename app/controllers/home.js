var _ = require('underscore'),
   fs = require('fs');

module.exports = function (app) {
    return {

        // Landing

        login:[
            function (req, res, next) {
                res.locals.title = 'Login Page';
                res.render('login');
            }],

        inventory:[
            function (req, res, next) {
                res.locals.title = 'Inventory';
                app.models.item.find({}, function(err, items){
                    //Sort by item ID
                    items = _.sortBy(items, function(e){return e.itemId});
                    res.locals.items = items;
                    next();
                })
            }],

        splash:[
            function(req, res, next){
                res.locals.title = 'Le Pants King Inventory System';
                res.render('splash');
            }
        ],

        inventorySoldOut:[
            function (req, res, next) {
                res.locals.title = 'Inventory Sold';
                app.models.item.find({soldOut:true}, function(err, items){
                    items = _.sortBy(items, function(e){return e.itemId});
                    res.locals.items = items;
                    next();
                })
            }],

        inventoryForSale:[
            function (req, res, next) {
                res.locals.title = 'Inventory Sold';
                app.models.item.find({soldOut:false}, function(err, items){
                    items = _.sortBy(items, function(e){return e.itemId});
                    res.locals.items = items;
                    next();
                })
            }],

        inventoryOnCart:[
            function (req, res, next) {
                res.locals.title = 'Inventory Sold';
                app.models.item.find({onCart:true}, function(err, items){
                    items = _.sortBy(items, function(e){return e.itemId});
                    res.locals.items = items;
                    next();
                })
            }],


        inventoryOnEtsy:[
            function (req, res, next) {
                res.locals.title = 'Inventory Sold';
                app.models.item.find({onEtsy:true}, function(err, items){
                    items = _.sortBy(items, function(e){return e.itemId});
                    res.locals.items = items;
                    next();
                })
            }],


        inventoryAtSowa:[
            function (req, res, next) {
                res.locals.title = 'Inventory Sold';
                app.models.item.find({onSowa:true}, function(err, items){
                    items = _.sortBy(items, function(e){return e.itemId});
                    res.locals.items = items;
                    next();
                })
            }],


        inventoryQuery:[
            function(req, res, next){
                res.locals.title = 'Query Items'
                var params = {};
                if(req.body){
                    params = req.body;
                }
                app.models.item.find(params, function(err, items){
                    res.locals.items = items;
                    next();
                });
            }
        ],

        inventoryAdded:[
            function (req, res, next) {
                var _id = req.params.id;
                var queryParams = {};
                queryParams._id = _id;
                res.locals.title = 'Inventory Added';
                app.models.item.find(queryParams, function(err, items){
                    res.locals.items = items;
                    res.locals.success = true;
                    res.locals.successType = 'added';
                    res.render('inventory');
                })
            }],

        inventoryUpdated:[
            function (req, res, next) {
                var _id = req.params.id;
                var queryParams = {};
                queryParams._id = _id;
                res.locals.title = 'Inventory Updated';
                app.models.item.find(queryParams, function(err, items){
                    res.locals.items = items;
                    res.locals.success = true;
                    res.locals.successType = 'updated';
                    res.render('inventory');
                })
            }],

        generateLabels:[
            function (req, res, next) {
                var ids = req.body.idsToGenerate;
                var queryParams = {};
                queryParams.$or = ids;
                res.locals.title = 'Labels';
                app.models.item.find(queryParams, function(err, items){
                    res.locals.items = items;
                    res.json(items);
                })
            }]
    };
};
