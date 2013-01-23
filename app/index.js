var base12 = require('base12');

module.exports = base12.app(__dirname);


//Handlebars Precompiler Setup
module.exports.configure('development', function(){
    hbsPrecompiler = require('handlebars-precompiler');
    hbsPrecompiler.watchDir(
        __dirname + "/views",
        __dirname + "/public/js/templates.js",
        ['handlebars', 'hbs']
    );
});
