const multer  = require('../images/multer');
var express = require('express');
var userRouter = express.Router();
var passport = require("../passport2");
var auth = require('../middleware/verify');
var sequelize = require("sequelize")
const profiles =require("../models/user_profiles");
const user =require("../models/users");
const biddingFeesModel = require("../models/bidding_fees");
var md5 = require('md5');
var auth = require('../middleware/verify');
const companies_profiles =require("../models/companies_profiles");
const offersModel =require("../models/offers");

const mimeTypeToExtension={
    "image/jpeg":"jpg",
    "image/png":"png",
    "image/svg+xml":"svg",
}

userRouter.post("/profiles", auth, multer.upload.none(),async function (req, res) {
    let userInfo=await profiles.findAll({
        where:{
            users_id:req.body.user_id
        },raw: true
    })
    res.send(userInfo)
});



userRouter.post("/profile/upload_photo",auth,multer.upload.single('photo'), function (req, res) {
        let profilesPhoto = "images/"+req.file.filename + "." + mimeTypeToExtension[req.file.mimetype];
        console.log(req.userData.muuid,profilesPhoto)
            profiles.update({photo:profilesPhoto}, { where: { users_id: req.userData.muuid } })
                .then((result) => {
                    let success = false;
                    if (result == 1) {
                        success = true;
                    }
                    res.send({
                        success: success,
                    });
                });
});

userRouter.post("/profile/upload_data",auth,multer.upload.none(), function (req, res) {
    let updateValues = JSON.parse(req.body.user);


    profiles.update(updateValues, { where: { users_id: req.userData.muuid } })
            .then((result) => {
                let success = false;
                if (result == 1) {
                    success = true;
                }
                res.send({
                    success: success,
                });
            });
})


userRouter.post("/profile/password",auth,multer.upload.none(),function (req,res) {
    let updateValues={
        password:md5(req.body.newPassword)
    }
    user.update(updateValues, { where: { id: req.session.userId,password:md5(req.body.oldPassword) } }).then((result) => {
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


userRouter.post("/offers",auth,multer.upload.none(),async function (req, res) {
    let offers= await offersModel.findAll({where:{
            type: "active"
        },raw:true});
    let biddingFees= await biddingFeesModel.findAll({where:{
            user_id:req.userData.muuid
        },raw:true});


    let profilesArray= await profiles.findAll({raw:true});
    let activeOffer = [];
    let userProfiles = [];

    profilesArray.filter(profile=>{
        userProfiles[profile.users_id]=profile
    })

    let feeArray = [];
    biddingFees.filter(fee=>{
        feeArray[fee.offer_id]=true;
    })

    let offerWithProfiles = [];

    offers.filter(offer=>{
        let feeResult=false
        if(feeArray[offer.id]==true){
            feeResult=true
        }
        offerWithProfiles.push({...offer,biddingFee:feeResult,profile:userProfiles[offer.userid]})
    })


    offerWithProfiles.filter(offer=>{
        activeOffer.push(offer)
    })

    let offer = {
        "active" : activeOffer
    }
    res.send(offer)
})

module.exports = userRouter;