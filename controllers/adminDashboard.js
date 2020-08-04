const multer  = require('../images/multer');
var express = require('express');
var auth = require('../middleware/verify');
var adminDashboard = express.Router();
var passport = require("../passport2");
const jwt = require('jsonwebtoken');
const biddingFees = require("../models/bidding_fees");
const profiles =require("../models/user_profiles");
const companies_profiles =require("../models/companies_profiles");
const user =require("../models/users");
const offersModel =require("../models/offers");

var md5 = require('md5');

const mimeTypeToExtension={
    "image/jpeg":"jpg",
    "image/png":"png",
    "image/svg+xml":"svg",
}

adminDashboard.post("/users",auth,multer.upload.none(),async function (req, res) {
    let userList =await user.findAll({raw: true,where:{type:"client"}})
    let profileList =await profiles.findAll({raw: true})
    let profileArray = []
    profileList.filter(profile=>{
        profileArray[profile.users_id]=profile
    })
    let together = []
    userList.filter(user=>{
        together.push({...user,profile:profileArray[user.id]})
    })

    res.send({count:together.length,data:together})
})

adminDashboard.post("/companies",auth,multer.upload.none(),async function (req, res) {
    let userList =await user.findAll({raw: true,where:{type:"company"}})
    let profileList =await companies_profiles.findAll({raw: true})
    let profileArray = []
    profileList.filter(profile=>{
        profileArray[profile.users_id]=profile
    })
    let together = []
    userList.filter(user=>{
        together.push({...user,profile:profileArray[user.id]})
    })
    res.send({count:together.length,data:together})
})

adminDashboard.post("/counts",auth,multer.upload.none(),async function (req, res) {
    let clientCount =await user.count({raw: true,where:{type:"client"}})
    let companiesCount =await user.count({raw: true,where:{type:"company"}})
    let offersConceptCount =await offersModel.count({raw: true,where:{status:"concept"}})
    let offersActiveCount =await offersModel.count({raw: true,where:{status:"active"}})
    let offersDoneCount =await offersModel.count({raw: true,where:{status:"done"}})
    let ReactionPartOne = offersConceptCount
    let ReactionPartTwo =await biddingFees.count({raw: true})
    let lastOffers =await offersModel.findAll({raw: true,limit:3});
    res.send({
        offersCount : offersActiveCount+offersConceptCount+offersDoneCount,
        companiesCount : companiesCount,
        clientCount : clientCount,
        lastOffers : lastOffers,
        reactionCount: ReactionPartOne+ ReactionPartTwo
    })
})

module.exports = adminDashboard;