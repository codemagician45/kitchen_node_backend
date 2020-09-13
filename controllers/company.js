const multer = require("../images/multer");
var express = require("express");
var companyRouter = express.Router();
var auth = require("../middleware/verify");
const CompanyProfiles = require("../models/companies_profiles");
const CompanyProfileSettings = require("../models/company_profile_settings");
const user = require("../models/users");
const biddingFees = require("../models/bidding_fees");
const messagingRooms = require("../models/messaging_rooms");
const messagesModel = require("../models/messages");
const offersModel =require("../models/offers");
const { Op } = require("sequelize");
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

companyRouter.post("/dashboard", auth, multer.upload.none(),async function (req, res) {
    let allBids = await biddingFees.findAll()
    let offersBids=[];
    allBids.filter(async bid=>{
        if(!offersBids[bid.offer_id]){
            console.log("yok",bid.offer_id,offersBids[bid.offer_id])
            offersBids[bid.offer_id]=[]
        }else{
            console.log("var",bid.offer_id,offersBids[bid.offer_id])
        }

        offersBids[bid.offer_id].push(bid.id)
        //offersBids[bid.offer_id]=offersBids[bid.offer_id].length+1
    })
    console.log(offersBids)
    let activeOffersCount = await offersModel.count({
        where:{status:"active"}
    })
    let paidBidOffers = await biddingFees.findAll({
        where:{user_id:req.userData.muuid},
        attributes:["offer_id"]
    })
    let paidBidOfferArray=[];
    paidBidOffers.forEach (bid=>{
        if(!paidBidOfferArray.includes(bid.offer_id)){
            paidBidOfferArray.push(bid.offer_id)
        }
    })
    let attendedOfferCount = await offersModel.count({
        where:{status:"attend",attend_id:req.userData.muuid}
    })
    let last2Offers = await offersModel.findAll({
        where:{status:"active"},
        order: [
            ['id', 'DESC']
        ],
        limit:2
    })
    let offersLastList=[];
    last2Offers.filter (async  offer=>{
        offer.reactionCount = offersBids[offer.id].length
        if(offer.reactionCount==null){
            offer.reactionCount=0
        }
        offersLastList.push(offer)
    })

    res.send({
        activeOffersCount:activeOffersCount,
        paidBidOfferCount:paidBidOfferArray.length,
        attendedOfferCount:attendedOfferCount,
        last2Offer:offersLastList
    })

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
    biddedOffers.filter(async (offer)=>{
        offer.reactionCount=await biddingFees.count({where:{offer_id:offer.id}})
    });
    let difference = allOffersList.filter(x => !biddedOffersList.includes(x));
    let notBiddedOffers = await offersModel.findAll({
        where:{
            id:difference,
            status:"active"
        }
    });
    notBiddedOffers.filter(async (offer)=>{
        offer.reactionCount=await biddingFees.count({where:{offer_id:offer.id}})
    });
    let AttendedOffers =  await offersModel.findAll({
        where: {
            status:"attend",
            attend_id: req.userData.muuid
        }, raw: true
    })
    AttendedOffers.filter(async (offer)=>{
        offer.reactionCount=await biddingFees.count({where:{offer_id:offer.id}})
    });
    let DoneOffers =  await offersModel.findAll({
        where: {
            status:"done",
            attend_id: req.userData.muuid
        }, raw: true
    })
    DoneOffers.filter(async (offer)=>{
        offer.reactionCount=await biddingFees.count({where:{offer_id:offer.id}})
    });
    res.send({"new":notBiddedOffers,
        "meineOffers":biddedWithPrice,
        "biddedNotPriceOffers":biddedNoPrice,
        "attendedOffers":AttendedOffers,
        "doneOffers":DoneOffers});
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
  res.send(payment.getCheckoutUrl());
});


companyRouter.post("/hook/:user_id/:offer_id", async function (req, res) {
    console.log("body",req.body);

    let offerInfo = await offersModel.findAll({where:{id:req.params.offer_id}})
    console.log("hook ran")
    mollieClient.payments
    .get(req.body.id)
    .then((payment) => {
        if(payment.isPaid()) {
            console.log("payment paid ran")
            ///create messaging room
            messagingRooms.findOrCreate({where:{
                "company_id":req.params.user_id,
                "user_id":offerInfo[0].userid
            }})
            ///create messaging room

            biddingFees.create({
                "offer_id":req.params.offer_id,
                "user_id":req.params.user_id,
                "mollie_id":payment.id
            }).then()

            ///create messaging room
            console.log("messaging room created between "+req.params.user_id+" and "+offerInfo[0].userid)

        }
    })
    .catch((error) => {
        console.log(error)
    })
  })

companyRouter.post("/getRooms", auth, multer.upload.none(), async function (req, res) {
    let rooms=await messagingRooms.findAll({where:{
            user_id:req.userData.muuid
        }})

    for (const room of rooms){
        let userProfiles=await user.findOne({where:{
                users_id:room.user_id
            }})
        if(userProfiles.salutation==null){
            userProfiles.salutation=""
        }
        if(userProfiles.name==null){
            userProfiles.name=""
        }
        if(userProfiles.surname==null){
            userProfiles.surname=""
        }
        room.userNameAndSurname=userProfiles.salutation+" "+userProfiles.name+" "+userProfiles.surname
        room.profilePhoto=userProfiles.photo

    }
    res.send(rooms)
})

companyRouter.post("/messages", auth, multer.upload.none(), async function (req, res) {
    let date= new Date().getTime()
    await messagesModel.update({isRead:true}, { where: {
            sender : {
                [Op.ne]:req.userData.muuid
            },
            date : {
                [Op.lte]:date
            },
            isRead:false
        }
    })
    let messages = await messagesModel.findAll({
        where:{ room_id:req.body.room_id}
    })

    messages.filter(message=>{
        if(message.sender==req.userData.muuid){
            message.sender="me"
        }else{
            message.sender="other"
        }
        return message
    })
    res.send({messages})
});


companyRouter.post("/sendMessage", auth, multer.upload.none(), async function (req, res) {
    let date= new Date().getTime()
    let success=true;
    let messages = await messagesModel.create({
        room_id: req.body.room_id,
        sender: req.userData.muuid,
        date: date,
        isRead:false,
        message:req.body.message,
        type:"text"
    }).catch((err) => {
        success: false
    });

    res.send({
        success:success
    })

});


companyRouter.post("/sendFileViaMessage", auth, multerFiles.upload.single("file"), async function (req, res) {
    let date= new Date().getTime()
    let success=true;
    let file = req.file.filename;
    fs.renameSync(req.file.path, "messagesFiles/"+req.file.filename+path.extname(req.file.originalname))
    console.log(req.file);
    await messagesModel.create({
        room_id: JSON.parse(req.body.room_id),
        sender: req.userData.muuid,
        date: date,
        isRead:false,
        message:file+path.extname(req.file.originalname),
        type:"file"
    }).catch((err) => {
        success: false
    });

    res.send({
        success:success
    })

});

module.exports = companyRouter;
