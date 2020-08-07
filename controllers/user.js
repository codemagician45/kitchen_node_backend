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
        let profilesPhoto = req.file.filename;
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
    user.update(updateValues, { where: { id: req.userData.muuid,password:md5(req.body.oldPassword) } }).then((result) => {
        let success=false;
        if(result==1){
            success=true
        }

        res.send({
            "success":success
        })
    });
})



userRouter.post("/getOffer",auth,multer.upload.none(),async function (req, res) {
    let offers = await offersModel.findAll({
        where: {
            id: req.body.id
        }, raw: true
    });
    res.send(offers)
})

userRouter.post("/offers",auth,multer.upload.none(),async function (req, res) {
    let offers=await offersModel.findAll({where:{
            userid:req.userData.muuid
        },raw:true});
    let bids=await biddingFeesModel.findAll({raw:true});
    let offerWithBid=[];
    offers.filter(offer=>{
        offer.bid=[];
        offerWithBid.push(offer)
    })
    bids.forEach(bid=>{
        offerWithBid.forEach(owb=>{
            if(owb.id==bid.offer_id){
                owb.bid.push(bid)
            }
        })
    })
    res.send(offerWithBid)

    /*
    let offerWithBidsArray;
    offerWithBid.filter(owb=>{
        offerWithBidsArray.push(owb);
    })
*/
})

module.exports = userRouter;