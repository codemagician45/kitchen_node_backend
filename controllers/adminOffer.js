const multer  = require('../images/multer');
var express = require('express');

var adminOffer = express.Router();
var passport = require("../passport2");
var auth = require('../middleware/verify');
const profileModel =require("../models/user_profiles");
const companies_profiles =require("../models/companies_profiles");
const user =require("../models/users");
const offersModel =require("../models/offers");
const biddingFees = require("../models/bidding_fees");

adminOffer.post("/",auth,multer.upload.none(),async function (req, res) {

    let offers= await offersModel.findAll({raw:true});
    let profiles= await profileModel.findAll({raw:true});
    let userLoginInfo = await user.findAll({raw:true});
    let adminUser=await user.findAll({where:{id:req.userData.muuid}})
    let bids = await biddingFees.findAll({raw:true});
    let conceptOffer = [];
    let activeOffer = [];
    let doneOffer = [];
    let userProfiles = [];

    let userLoginInfoArray=[];
    userLoginInfo.filter(loginInfo=>{userLoginInfoArray[loginInfo.id]=loginInfo.email})

    profiles.filter(profile=>{
        profile.email=userLoginInfoArray[profile.users_id];
        userProfiles[profile.users_id]=profile
    })

    let offerWithProfiles = [];
    let bidArray=[];
    bids.filter((bid)=>{
        if(bidArray[bid.offer_id]) {
            bidArray[bid.offer_id] += 1
        }else{
            bidArray[bid.offer_id] = 1
        }
    })
    offers.filter((offer)=>{
        let isNew=false
        if(Number(adminUser[0].previous_login)<Number(offer.creation_time)*1000){
            isNew=true
        }
        offer.isNew=isNew
        offer.reactionCount = bidArray[offer.id]
        offerWithProfiles.push({...offer,profile:userProfiles[offer.userid]})
    })
    offerWithProfiles.filter(async (offer)=>{
        if(offer.reactionCount==null){
            offer.reactionCount=0
        }
        if(offer.status=="concept"){
            conceptOffer.push(offer)
        }else if(offer.status=="active"){
            activeOffer.push(offer)
        }else if(offer.status=="attend"){
            doneOffer.push(offer)
        }
    })

    let offer = {
        "concept":conceptOffer,
        "active" : activeOffer,
        "done" : doneOffer
    }
    res.send(offer)
})

module.exports = adminOffer;