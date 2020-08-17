const multer = require("../images/multer");
var express = require("express");
var companyRouter = express.Router();
var auth = require("../middleware/verify");
const CompanyProfiles = require("../models/companies_profiles");
const CompanyProfileSettings = require("../models/company_profile_settings");
const user = require("../models/users");
const biddingFees = require("../models/bidding_fees");
const offersModel =require("../models/offers");
var fs = require('fs');
var md5 = require('md5');
var path = require('path')

const { createMollieClient } = require("@mollie/api-client");


Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}



const mollieClient = createMollieClient({
  apiKey: "test_J53TsrBnHFG6HMUdUUJ5xysQgNTpj5",
});

var md5 = require("md5");

const mimeTypeToExtension = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
};

companyRouter.post(
  "/profile/upload_photo",
  auth,
  multer.upload.single("photo"),
  function (req, res) {
    let profilesPhoto = req.file.filename;
      CompanyProfiles.update({photo:profilesPhoto}, { where: { users_id: req.userData.muuid } })
      .then((result) => {
        let success = false;
        if (result == 1) {
          success = true;
        }
        res.send({
          success: success,
        });
      });
  }
);

companyRouter.post("/profile/getSettings",auth,multer.upload.none(),async function (req,res){
    await CompanyProfileSettings.findAll({where:{company_id:req.body.company_id}}).then((settings)=>{
        res.send(
            settings
        )
    })
})
companyRouter.post("/profile/settings", auth, multer.upload.none(),async function (req, res) {
    await CompanyProfileSettings.findAll({where:{company_id:req.userData.muuid}}).then(async (setting_new) => {
        if(setting_new.length==0) {
            await CompanyProfileSettings.create({
                company_id: req.userData.muuid,
                website: req.body.website,
                services: req.body.services,
                about_company: req.body.about_company,
                opening_hours: req.body.opening_hours,
                reviews: req.body.reviews,
            }, {where: {company_id: req.userData.muuid}}).then(async (settings) => {
               if(settings.dataValues.id){
                   res.send({
                       success:true
                   })
               }
            })
        }else{
            await CompanyProfileSettings.update({company_id:req.userData.muuid,
                website:req.body.website,
                services:req.body.services,
                about_company:req.body.about_company,
                opening_hours:req.body.opening_hours,
                reviews:req.body.reviews,
            },{where:{company_id:req.userData.muuid}}).then(async (settings)=>{
                res.send({
                    success:true
                })

            })
        }
    })

    }
);

companyRouter.post("/profile/upload_data",auth,multer.upload.none(), function (req, res) {
    let updateValues = JSON.parse(req.body.user);
    CompanyProfiles.update(updateValues, { where: { users_id: req.userData.muuid } })
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





companyRouter.post("/profile/password", auth, multer.upload.none(), function (
  req,
  res
) {
  let updateValues = {
    password: md5(req.body.newPassword),
  };
  user
    .update(updateValues, {
      where: { id: req.userData.muuid, password: md5(req.body.oldPassword) },
    })
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

companyRouter.post("/profiles", auth, multer.upload.none(),async function (req, res) {
    let companyInfo=await CompanyProfiles.findAll({
        where:{
            users_id:req.body.user_id
        },raw: true
    })
    res.send(companyInfo)
});


companyRouter.post("/offers", auth, multer.upload.none(),async function (req, res) {

    let allOffers = await offersModel.findAll({
        raw: true
    })
    let biddedOffers = await biddingFees.findAll({
            where: {
                user_id: req.userData.muuid
            }, raw: true
        })
    let allOffersList = allOffers.map(function (offer) {
        return offer.id
    })
    let biddedOffersList = biddedOffers.map(function (offer) {
        return offer.offer_id
    })
    let biddedWithPrice=[];
    let biddedNoPrice=[];
    biddedOffers.forEach(biddedOffer=>{
        biddedOffer.offerDetail=allOffers.find( offer => offer.id == biddedOffer.offer_id)
        if(biddedOffer.bid==null){
            biddedNoPrice.push(biddedOffer)
        }else{
            biddedWithPrice.push(biddedOffer)
        }
    })
    let difference = allOffersList.filter(x => !biddedOffersList.includes(x));
    let notBiddedOffers = await offersModel.findAll({
        where:{
            id:difference,
            status:"active"
        }
    });
    let AttendedOffers =  await offersModel.findAll({
        where: {
            status:"attended",
            attend_id: req.userData.muuid
        }, raw: true
    })
    let DoneOffers =  await offersModel.findAll({
        where: {
            status:"done",
            attend_id: req.userData.muuid
        }, raw: true
    })
    res.send({"new":notBiddedOffers,"meineOffers":biddedWithPrice,"biddedNotPriceOffers":biddedNoPrice,"attendedOffers":AttendedOffers,"doneOffers":DoneOffers});
});


companyRouter.post("/becomeBidder", auth, multer.upload.array("files[]"), function (req, res) {
    let biddingFeeDetail;
    req.body.bid = JSON.parse(req.body.bid)
    biddingFees.update({
        "bid":req.body.bid.bid,
        "note":req.body.bid.note
    },{where: {
            "offer_id":req.body.bid.offer_id,
            "user_id":req.userData.muuid,
        }}).then(async ()=>{
        let biddingFeeDetail=await biddingFees.findAll({
            where:{
                offer_id:req.body.bid.offer_id,
                user_id:req.userData.muuid,
            },raw: true
        })
        biddingFeeDetail=biddingFeeDetail[0]
        let folder_name = "uploaded_files/"+req.body.bid.offer_id+"_offer"
        let bidNumber=biddingFeeDetail.id
    fs.mkdirSync(folder_name+"/bids/"+bidNumber)
    let filePaths = [];
    for (let i=0;i<req.files.length;i++) {
        let extension = path.extname(req.files[i].originalname)
        fs.renameSync(req.files[i].path, folder_name+"/bids/"+bidNumber+"/"+req.files[i].filename+path.extname(req.files[i].originalname))
        filePaths.push(folder_name+"/bids/"+bidNumber+"/"+req.files[i].filename+path.extname(req.files[i].originalname))
    }
        biddingFees.update({files:JSON.stringify(filePaths)},{where : {
                    id : biddingFeeDetail.id
                }})


            res.send({
            success: true ,
            biddingDetail : biddingFeeDetail,
        });
    })


});




companyRouter.post("/pay", auth, multer.upload.none(), async function (req, res) {

  let amount = req.body.amount.toFixed(2).toString();
  const payment = await mollieClient.payments.create({
    amount: {
      currency: "EUR",
      value: amount, // We enforce the correct number of decimals through strings
    },
    description: "Bidding for new job",
    redirectUrl: "https://feestvanverbinding.nl/companies/offers",
    // redirectUrl: "http://localhost:3005/companies/offers",
    // webhookUrl: "https://acc27f51ead7.ngrok.io/companies/hook",
    webhookUrl: " http://feestvanverbinding.nl/api/companies/hook/"+req.userData.muuid+"/"+req.body.offer_id,
  });
    console.log(payment);
  console.log(payment.id);
    console.log("pay worked");
  res.send(payment.getCheckoutUrl());
});
/*
companyRouter.post("/check_pay", async function (req, res) {

  mollieClient.payments
    .get(req.body.payment_id)companies/profile/upload
    .then((payment) => {
      // E.g. check if the payment.isPaid()
      res.send(payment.isPaid())
    })
    .catch((error) => {
      // Handle the error
    });
});
*/
companyRouter.post("/hook/:user_id/:offer_id", async function (req, res) {

    console.log("body",req.body);
    mollieClient.payments
    .get(req.body.id)
    .then((payment) => {
        if(payment.isPaid()) {
            biddingFees.create({
                "offer_id":req.params.offer_id,
                "user_id":req.params.user_id,
                "mollie_id":payment.id
            }).then()
        }
    })
    .catch((error) => {
      // Handle the error
    });
  });

module.exports = companyRouter;
