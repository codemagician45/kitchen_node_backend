const multer  = require('multer');

var upload = multer({ dest: __dirname+"/temporary" })

module.exports.upload = upload