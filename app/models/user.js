var mongoose = require('mongoose');

module.exports = function (app) {
    var UserSchema = new mongoose.Schema({
        username:{ type:String, required:true, unique:true },
        email:{ type:String, unique:false },
        password:{ type:String, required:true},
        admin:{type:Boolean, required:true, default:false}
    });

    return mongoose.model('users', UserSchema);
}