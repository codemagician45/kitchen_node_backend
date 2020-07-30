const multer = require("../images/multer");
var express = require("express");
var companyRouter = express.Router();
var passport = require("../passport2");
var auth = require("../middleware/verify");
const CompanyProfiles = require("../models/companies_profiles");
const user = require("../models/users");
const biddingFees = require("../models/bidding_fees");
const offersModel =require("../models/offers");
const profiles =require("../models/user_profiles");

const { createMollieClient } = require("@mollie/api-client");

function arr_diff (a1, a2) {

    var a = [], diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

async function getOfferInfo (offerId) {
    let offers= await offersModel.findAll({where:{
            id:offerId
        },raw:true});
    return offers;
}

async function getProfileInfo (userId) {
    let profile= await profiles.findAll({where:{
            id:userId
        },raw:true});
    return profile;
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
  "/profile/upload",
  auth,
  multer.upload.single("photo"),
  function (req, res) {
    let updateValues = JSON.parse(req.body.user);
    console.log(updateValues)
    updateValues.photo = "images/"+req.file.filename + "." + mimeTypeToExtension[req.file.mimetype],

    console.log(updateValues)
      CompanyProfiles
      .update(updateValues, { where: { users_id: req.userData.muuid } })
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
  req.session.destroy();
});

companyRouter.post("/offers", auth, multer.upload.none(),async function (req, res) {

    let allOffers = await offersModel.findAll({
        where:{
            status:"new"
        },raw: true
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
    let difference = allOffersList.filter(x => !biddedOffersList.includes(x));
    let notBiddedOffers = await offersModel.findAll({
        where:{
            id:difference
        }
    });
    let MeineOffers =  await offersModel.findAll({
        where: {
            status:"new",
            attend_id: req.userData.muuid
        }, raw: true
    })
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
    res.send({"new":notBiddedOffers,"meineOffers":MeineOffers,"attendedOffers":AttendedOffers,"doneOffers":DoneOffers});

/*
    let offersFinalWithUserInfo = await offersFinal.filter(async offersFinal=>{
        offersFinal.user=getProfileInfo(offersFinalWithUserInfo.userId);
        delete offersFinal.user_id;
        return biddingFee;
    })
*/


});


companyRouter.post("/becomeBidder", auth, multer.upload.none(), function (req, res) {
    biddingFees.create({
        "offer_id":req.body.offer_id,
        "user_id":req.userData.muuid,
        "mollie_id":getRandomInt(100000000)
    }).then((result)=>{
        let success=false;
        if (result.id>0) {
            success = true;
        }

        res.send({
            success: success ,
            biddingDetail : result,
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
    webhookUrl: "https://feestvanverbinding.nl/companies/hook",
  });
  console.log(payment.id);
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
companyRouter.post("/hook", async function (req, res) {

    console.log(req.body);
    mollieClient.payments
    .get(req.body.id)
    .then((payment) => {
      // E.g. check if the payment.isPaid()
      console.log(payment.isPaid())
    })
    .catch((error) => {
      // Handle the error
    });
  });

module.exports = companyRouter;
