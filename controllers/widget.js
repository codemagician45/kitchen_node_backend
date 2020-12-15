const {request} = require('gaxios');

const multer  = require('../uploaded_files/multer_document');
var express = require('express');
var widgetRouter = express.Router();
const profile =require("../models/user_profiles");
const user =require("../models/users");
const offers = require("../models/offers");
var fs = require('fs');
var md5 = require('md5');
var path = require('path')

const mailSender = require("../mailSender");
const mimeTypeToExtension={
    "image/jpeg":"jpg",
    "image/png":"png",
    "image/svg+xml":"svg",
}

function randomStringGenerator(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

widgetRouter.post("/offer",multer.upload.array("files[]"),async function (req,res) {
    let userSpecs;
        console.log(req.body.offer)
    req.body.offer= JSON.parse(req.body.offer)
    let password = randomStringGenerator(10)
    let user_data= await user.findOne({
        where : {
            email : req.body.offer.specs.user.email
        }
    })
    if(!user_data) {
        console.log("user is not exist")
        let pass=randomStringGenerator(10)
        let responsed = await request({
            url: 'http://localhost:3100/register',
            method: 'POST',
            data: {
                email:req.body.offer.specs.user.email,
                password:pass
            }
        })
        userSpecs=responsed.data.user
    }else{
        userSpecs = user_data
    }

    let ts=Date.now();
    req.body.offer.specs.creation_time = Math.floor(ts/1000);
    delete req.body.offer.specs.user
    req.body.offer.specs.userid= userSpecs.id
    req.body.offer.specs.status= "concept"
    req.body.offer.specs.type = req.body.offer.type
    offers.create(
        req.body.offer.specs
    ).then(async newOffer=>{

        let folder_name = "uploaded_files/"+newOffer.dataValues.id+"_offer"
        fs.mkdirSync(folder_name)
        fs.mkdirSync(folder_name+"/old")
        fs.mkdirSync(folder_name+"/new")
        fs.mkdirSync(folder_name+"/bids")
        let filePaths = [];
        for (let i=0;i<req.files.length;i++) {
            fs.renameSync(req.files[i].path, folder_name+"/old/"+req.files[i].filename+path.extname(req.files[i].originalname))
            filePaths.push(folder_name+"/old/"+req.files[i].filename+path.extname(req.files[i].originalname))
        }

            offers.update({old_files:JSON.stringify(filePaths)},{where : {
                id : newOffer.dataValues.id
                }})

        await user.findOne({where:{id:req.body.offer.specs.userid}}).then((user)=>{
            mailSender.mail(user.email,"Je offerte aanvraag is door ons ontvangen. ","Beste,<br>"+
                "Je offerte aanvraag is door ons ontvangen.<br>"+
                "We hebben je lidmaatschap verwerkt.<br>"+
                "Binnenkort zal de beheerder je offerte op actief zetten.<br>"+
                "Daar ontvang je nog een bericht over.");

            mailSender.mail("admin@keukenvergelijking.nl","Er is een nieuw conceptvoorstel binnengekomen. ","Er is een nieuw conceptvoorstel binnengekomen.Ik zou het op actief moeten zetten. ");
        })



        let clientCount =await user.count({raw: true,where:{type:"client"}})
        let companiesCount =await user.count({raw: true,where:{type:"company"}})
        let offersConceptCount =await offers.count({raw: true,where:{status:"concept"}})
        let offersActiveCount =await offers.count({raw: true,where:{status:"active"}})
        let offersAttendCount =await offers.count({raw: true,where:{status:"attend"}})
        let offersDoneCount =await offers.count({raw: true,where:{status:"done"}})
        let ReactionPartOne = offersConceptCount

        mailSender.mail("admin@keukenvergelijking.nl","Stuur dagelijks een verslag",
            "offersCount : "+ offersConceptCount + "<br>" +
            "companiesCount :"+ companiesCount + "<br>" +
            "clientCount : "+ clientCount + "<br>" +
            "offersActiveCount : "+  offersActiveCount + "<br>" +
            "offersAttendCount : "+  offersAttendCount + "<br>" +
            "offersDoneCount : "+  offersDoneCount + "<br>" +
            "reactionCount: "+ReactionPartOne + "<br>"
            );
        res.send({
            success:true
        })
    }).catch(err=>{
        res.send(err)
    })




    let folder_name = "./uploaded_files/"+req.body.test

})

module.exports = widgetRouter;