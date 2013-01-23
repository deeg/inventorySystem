var _ = require('underscore'),
    Items = require('../models/item')();

module.exports = function (app) {
    var controller = {};

    /*
     Generic CRUD functions for any model
     */
    controller.search = [
        /*
         route functions get 3 args - the request object, the response object, and next - a callback to move on
         to the next middleware.
         req.query = json object with query string arguments
         req.params = json object with values of routing params such as :model or :id
         req.body = json request body from post / put requests
         */
        function (req, res, next) {
            var query = req.query;
            //req.Model is a value I set in libs/params.js
            req.Model.find(query, function (err, docs) {
                if (err) return next(err);
                return res.json(docs);
            });
        }
    ]

    controller.create = [
        function (req, res, next) {
            req.Model.find({}, 'itemId', function(err, items){
                if(items.length >= 1){
                    //There are already items, find the highest ID and increment by one.
                    var itemIds = _.pluck(items, 'itemId');
                    var maxId = _.max(itemIds);
                    var newItemId = maxId + 1;
                    req.body.itemId = newItemId;
                }else{
                    //No items, give id of 1
                    req.body.itemId = 1;
                }

                //Create model object and save
                var model = new req.Model(req.body);
                model.save(function (err, doc) {
                    if (err) return next(err);
                    return res.json(doc);
                })
            })
        }
    ]
    controller.read = [
        function (req, res, next) {
            var id = req.params.id;
            req.Model.findById(id, function (err, doc) {
                if (err) return next(err);
                if (doc === null) return res.send(404);
                return res.json(doc);
            });
        }
    ]
    //Generic Update for any model
    controller.update = [
        function (req, res, next) {
            var id = req.params.id;
            //default update is a full replace
            //may want to give attribute replacement instead?
            req.Model.findByIdAndUpdate(id, req.body, function (err, doc) {
                if (err) return next(err);
                if (doc === null) return res.send(404);
                return res.json(doc);
            })
        }
    ]
    //Update of cart item.
    controller.updateItem = [
        function (req, res, next) {
            var id = req.params.id;
            Items.findById(id, function(err, item){
                //Determine if sold out
                req.body.soldOut = (req.body.quantity == '0');
                //Determine if low in inventory
                req.body.lowOnInventory = req.body.quantity < 5

                //Extend item with updated fields
                var item = _.extend(item, req.body)

                //Save new item
                item.save(function(err, doc){
                    if(err) return next(err);
                    if (doc === null) return res.send(404);
                    return res.json(doc);
                })
            })
        }
    ]

    //Process sale of an item
    controller.sellItem = [
        function (req, res, next) {
            var id = req.params.id;
            Items.findById(id, function(err, item){
                var unitsSold = req.body.unitsSold ? +req.body.unitsSold : 0;
                var salePrice = req.body.salePrice ? +req.body.salePrice : 0;
                if(unitsSold != 0){
                    //Selling items, update with new statistics
                    item.totalSales = item.totalSales + (unitsSold * salePrice);
                    item.unitsSold = item.unitsSold + unitsSold;
                    item.averageSalePrice = item.totalSales / item.unitsSold;
                    item.margin = item.averageSalePrice - item.cost;

                    //Update quantity
                    item.quantity = item.quantity - unitsSold;
                }

                //Determine if sold out
                item.soldOut = (item.quantity == 0);
                //Determine if low in inventory
                item.lowOnInventory = req.body.quantity < 5

                item.save(function(err, doc){
                    if(err) next(err);
                    if (doc === null) return res.send(404);
                    return res.json(doc);
                })
            })
        }
    ]

    controller.destroy = [
        function (req, res, next) {
            var id = req.params.id;
            req.Model.findByIdAndRemove(id, function (err, doc) {
                if (err) return next(err);
                if (doc === null) return res.send(404);
                return res.send(204);
            })
        }
    ]

    return controller;
}