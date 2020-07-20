const multer  = require('multer');
const fs= require("fs");

var upload = multer({ dest: __dirname })

module.exports.upload = upload