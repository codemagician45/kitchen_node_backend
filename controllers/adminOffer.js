const multer  = require('../images/multer');
var express = require('express');

var adminOffer = express.Router();
var passport = require("../passport2");
var auth = require('../middleware/verify');
const profileModel =require("../models/user_profiles");
const companies_profiles =require("../models/companies_profiles");
const user =require("../models/users");
const offersModel =require("../models/offers");

adminOffer.post("/",auth,multer.upload.none(),async function (req, res) {
    let offers= await offersModel.findAll({raw:true});
    let profiles= await profileModel.findAll({raw:true});
    let conceptOffer = [];
    let activeOffer = [];
    let doneOffer = [];
    let userProfiles = [];

    profiles.filter(profile=>{
        userProfiles[profile.users_id]=profile
    })

    console.log(userProfiles)

    let offerWithProfiles = [];
    offers.filter(offer=>{
        offerWithProfiles.push({...offer,profile:userProfiles[offer.userid]})
    })


    console.log(offerWithProfiles)

    offerWithProfiles.filter(offer=>{
        if(offer.type=="concept"){
            conceptOffer.push(offer)
        }else if(offer.type=="active"){
            activeOffer.push(offer)
        }else if(offer.type=="done"){
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