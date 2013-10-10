var _ = require('underscore'),
   fs = require('fs');
   Items = require('../models/item.js');

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
                Items.find({}, function(err, items){
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
                Items.find({soldOut:true}, function(err, items){
                    items = _.sortBy(items, function(e){return e.itemId});
                    res.locals.items = items;
                    next();
                })
            }],

        inventoryForSale:[
            function (req, res, next) {
                res.locals.title = 'Inventory Sold';
                Items.find({soldOut:false}, function(err, items){
                    items = _.sortBy(items, function(e){return e.itemId});
                    res.locals.items = items;
                    next();
                })
            }],

        inventoryOnCart:[
            function (req, res, next) {
                res.locals.title = 'Inventory Sold';
                Items.find({onCart:true}, function(err, items){
                    items = _.sortBy(items, function(e){return e.itemId});
                    res.locals.items = items;
                    next();
                })
            }],


        inventoryOnEtsy:[
            function (req, res, next) {
                res.locals.title = 'Inventory Sold';
                Items.find({onEtsy:true}, function(err, items){
                    items = _.sortBy(items, function(e){return e.itemId});
                    res.locals.items = items;
                    next();
                })
            }],


        inventoryAtSowa:[
            function (req, res, next) {
                res.locals.title = 'Inventory Sold';
                Items.find({onSowa:true}, function(err, items){
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
                Items.find(params, function(err, items){
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
                Items.find(queryParams, function(err, items){
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
                Items.find(queryParams, function(err, items){
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
                Items.find(queryParams, function(err, items){
                    res.locals.items = items;
                    res.json(items);
                })
            }]
    };
};
