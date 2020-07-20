const multer  = require('../images/multer');
var express = require('express');
var auth = require('../middleware/verify');
var adminDashboard = express.Router();
var passport = require("../passport2");
const jwt = require('jsonwebtoken');
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


/*
adminDashboard.post("/adminTestLogin",multer.upload.none(),async function (req,res) {
    console.log("admin Logged IN test ")
    let userInfo=await user.findOne({ where :{email : req.body.email, password: md5(req.body.password)}})
    if(userInfo) {
        console.log(userInfo)
        console.log("admin Logged IN")
        const token = jwt.sign({
                muuid: userInfo.id,
                memail: userInfo.email,
                cid: userInfo.type
            },
            'secret_key',
            {
                expiresIn :"2h"
            })
        res.send({"login":"success","token":token});
    }
})
*/
adminDashboard.post("/adminTestLoginAuth",auth,multer.upload.none(),async function (req,res) {
    console.log("auth test")

})
adminDashboard.post("/counts",auth,multer.upload.none(),async function (req, res) {
    let clientCount =await user.count({raw: true,where:{type:"client"}})
    let companiesCount =await user.count({raw: true,where:{type:"company"}})
    let offersConceptCount =await offersModel.count({raw: true,where:{type:"concept"}})
    let offersActiveCount =await offersModel.count({raw: true,where:{type:"active"}})
    let offersDoneCount =await offersModel.count({raw: true,where:{type:"done"}})
    let lastOffers =await offersModel.findAll({raw: true,limit:3});
    res.send({
        offersCount : offersActiveCount+offersConceptCount+offersDoneCount,
        companiesCount : companiesCount,
        clientCount : clientCount,
        lastOffers : lastOffers
    })
})

module.exports = adminDashboard;