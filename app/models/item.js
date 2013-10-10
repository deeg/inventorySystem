var mongoose = require('mongoose'),
    _ = require('underscore');


    var ItemSchema = new mongoose.Schema({
        itemId:{type:Number, required:true, unique:true},
        type:{type:String, required:true},
        consigner:{type: String, required:true},
        size: String,
        color: String,
        gender: String,
        material:String,
        quantity:{type:Number, default:1},
        description:String,
        onCart: Boolean,
        onEtsy: Boolean,
        onSowa: Boolean,
        cost: Number,
        askingPrice: Number,
        baselineSalePrice: Number,
        pointOfPurchase: String,
        margin:{type: Number, default: 0},
        lowOnInventory:Boolean,
        soldOut: {type:Boolean, default:false},
        unitsSold: {type: Number, default:0},
        averageSalePrice: {type: Number, default:0},
        totalSales: {type:Number, default:0},
        saleDate: String,
        purchaseDate:{type: String, required:true},
        picture: String,
        qrCode: String
    })

    module.exports = mongoose.model('items', ItemSchema);

