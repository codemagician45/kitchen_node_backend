const multer  = require('../uploaded_files/multer_document');
var express = require('express');
var widgetRouter = express.Router();
const profile =require("../models/user_profiles");
const user =require("../models/users");
const offers = require("../models/offers");
var fs = require('fs');
var md5 = require('md5');
var path = require('path')

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

    req.body.offer= JSON.parse(req.body.offer)

    let password = randomStringGenerator(10)
    let user_data= await user.findOne({
        where : {
            email : req.body.offer.specs.user.email
        }
    })
    if(!user_data) {
        await user.create({
            email: req.body.offer.specs.user.email,
            password: md5(password),
            type: "client"
        }).then(newUser=>{
            userSpecs =newUser.dataValues
        }).catch(err => {
            res.send({
                success: false,
                reason: err.name
            })
        })

        await profile.create({
            users_id : userSpecs.id
        }).catch(err=>{
            console.log(err)
        })


    }else{
        userSpecs = user_data
    }

    let ts=Date.now();
    req.body.offer.specs.creation_time = Math.floor(ts/1000);
    delete req.body.offer.specs.user
//    req.body.offer.specs.files = "[\"eklenecek\",\"eklenecek2\"]"
    req.body.offer.specs.userid= userSpecs.id
    req.body.offer.specs.status= "concept"

    offers.create(
        req.body.offer.specs
    ).then(newOffer=>{

        let folder_name = "./uploaded_files/"+newOffer.dataValues.id+"_offer"
        fs.mkdirSync(folder_name)
        fs.mkdirSync(folder_name+"/old")
        fs.mkdirSync(folder_name+"/new")

        let filePaths = [];
        for (let i=0;i<req.files.length;i++) {
            let extension = path.extname(req.files[i].originalname)
            fs.renameSync(req.files[i].path, folder_name+"/old/"+req.files[i].filename+"."+extension)
            filePaths.push(folder_name+"/old/"+req.files[i].filename+extension)
        }

            offers.update({files:JSON.stringify(filePaths)},{where : {
                id : newOffer.dataValues.id
                }})


        res.send({
            success:true
        })
    }).catch(err=>{
        res.send(err)
    })




    let folder_name = "./uploaded_files/"+req.body.test

})

module.exports = widgetRouter;