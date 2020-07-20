const multer  = require('../images/multer');
var express = require('express');
var companyRouter = express.Router();
var passport = require("../passport2");
var auth = require('../middleware/verify');
const profiles =require("../models/companies_profiles");
const user =require("../models/users");

var md5 = require('md5');

const mimeTypeToExtension={
    "image/jpeg":"jpg",
    "image/png":"png",
    "image/svg+xml":"svg",
}

companyRouter.post("/profile/upload",auth,multer.upload.single('photo'),function (req,res) {
    let updateValues = req.body;
    updateValues = {
        ...updateValues,
        "photo": req.file.filename+"."+mimeTypeToExtension[req.file.mimetype]
    }
    profiles.update(updateValues, { where: { users_id: req.userData.muuid } }).then((result) => {
        let success=false;
        if(result==1){
            success=true
        }
        res.send({
            "success":success
        })
    });
})


companyRouter.post("/profile/password",auth,multer.upload.none(),function (req,res) {
    let updateValues={
        password:md5(req.body.newPassword)
    }
    user.update(updateValues, { where: { id: req.userData.muuid,password:md5(req.body.oldPassword) } }).then((result) => {
        let success=false;
        if(result==1){
            success=true
        }

        res.send({
            "success":success
        })
    });
    req.session.destroy();
})

module.exports = companyRouter;