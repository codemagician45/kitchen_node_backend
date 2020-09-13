const multer  = require('../images/multer');
const multerFiles = require('../messagesFiles/multer');
var express = require('express');
var userRouter = express.Router();
var fs = require('fs');
var passport = require("../passport2");
var auth = require('../middleware/verify');
var sequelize = require("sequelize")
const { Op } = require("sequelize");
const profiles =require("../models/user_profiles");
const user =require("../models/users");
const biddingFeesModel = require("../models/bidding_fees");
var md5 = require('md5');
var auth = require('../middleware/verify');
var path = require('path');
const companies_profiles =require("../models/companies_profiles");
const CompanyProfileSettings = require("../models/company_profile_settings");
const offersModel =require("../models/offers");
const messagingRooms = require("../models/messaging_rooms");
const messagesModel = require("../models/messages");
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

userRouter.post("/dashboard",auth,multer.upload.none(),async function (req,res) {
    let last2Offers = await offersModel.findAll({
        where:{userid:req.userData.muuid},
        order: [
            ['id', 'DESC']
        ],
        limit:2
    })
    last2Offers.filter(async offer=>{
        offer.reactionCount = await biddingFeesModel.count({where:{offer_id:offer.id}})
        console.log(offer)
        return offer
    })
    let offersCount = await offersModel.count(
        {
            where: {
                userid: req.userData.muuid,
                status: {
                    [sequelize.Op.not]: ["done"]
                }
            }
        }
    )
    let activeOffers = await offersModel.findAll({
        attributes:["id"],
        where:{
            userid: req.userData.muuid,
            status:"active"
        }
    })
    let attendedOffersCount = await offersModel.count({
        where:{
            userid: req.userData.muuid,
            status:"attend"
        }
    })
    let activeOffersIdArray=[];
    activeOffers.forEach (offer=>{
        activeOffersIdArray.push(offer.id)
    })
    let totalActiveOfferBidsCount = await biddingFeesModel.count({
        where:{
            offer_id:activeOffersIdArray,
            bid:{
                [sequelize.Op.ne]: null
            }
        }
    })
    res.send({
        success: true,
        offersCount:offersCount,
        totalActiveOfferBidsCount:totalActiveOfferBidsCount,
        attendedOffersCount:attendedOffersCount,
        lastOffers:last2Offers
    })

})

userRouter.post("/getOffer",auth,multer.upload.none(),async function (req, res) {
    let offers = await offersModel.findAll({
        where: {
            id: req.body.id
        }, raw: true
    });
    let bids = await biddingFeesModel.findAll({
        where:{
            offer_id:req.body.id
        }
    })
    console.log(bids)
    let companiesProfile = await companies_profiles.findAll()

    offers.forEach(offer=>{
        offer.bid=[]
        bids.forEach(bid=>{
            companiesProfile.forEach(companyProfile=>{
                if(bid.user_id==companyProfile.users_id){
                    bid={...bid,
                        company_name: companyProfile.name,
                        photo: companyProfile.photo,
                    }
                }
            })
        offer.bid.push(bid)
        })
    })
    res.send(offers)
})


userRouter.post("/offers/getBidInfo",auth,multer.upload.none(),async function (req, res) {
    await biddingFeesModel.findAll({where:{id:req.body.bidId}}).then(async bid=>{
        bid=bid[0]
        let settings=await CompanyProfileSettings.findAll({where:{company_id:bid.user_id}});
        let profile=await companies_profiles.findAll({where:{users_id:bid.user_id}});
        let offer=await offersModel.findAll({where:{id:bid.offer_id}});
        bid.settings=settings[0];
        bid.profile=profile[0];
        bid.offer=offer[0];
        res.send(bid)
    })
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

userRouter.post("/attendOffer",auth,multer.upload.none(),async function (req, res) {
    console.log("body",req.body)
    console.log("req.userData",req.userData)
    await offersModel.update(
        {status:"attend",attend_id:req.body.company_id },
        { where:
                { userid: req.userData.muuid,id:req.body.offer_id } }).then((result) => {
            let success = false;
            if (result == 1) {
                success = true;
            }
            res.send({
                success: success,
            });
        })
})

userRouter.post("/getRooms", auth, multer.upload.none(), async function (req, res) {
    let rooms=await messagingRooms.findAll({where:{
            user_id:req.userData.muuid
        },order: [
            ['id', 'DESC'],
        ]})

    for (const room of rooms){
        let companyProfiles=await companies_profiles.findOne({where:{
                users_id:room.company_id
        }})
        if(companyProfiles.salutation==null){
            companyProfiles.salutation=""
        }
        if(companyProfiles.name==null){
            companyProfiles.name=""
        }
        if(companyProfiles.surname==null){
            companyProfiles.surname=""
        }
        room.nameAndSurname=companyProfiles.salutation+" "+companyProfiles.name+" "+companyProfiles.surname
        room.profilePhoto=companyProfiles.photo

    }
    res.send(rooms)
})

userRouter.post("/messages", auth, multer.upload.none(), async function (req, res) {
    let date= new Date().getTime()
    await messagesModel.update({isRead:true}, { where: {
            sender : {
                [Op.ne]:req.userData.muuid
            },
            date : {
                [Op.lte]:date
            }
        }
    })
    let messages = await messagesModel.findAll({
        where:{ room_id:req.body.room_id},
        order: [
            ['id', 'ASC'],
        ]})



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

userRouter.post("/sendMessage", auth, multer.upload.none(), async function (req, res) {
    let date= new Date().getTime()
    let success=true;
    await messagesModel.create({
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


userRouter.post("/sendFileViaMessage", auth, multerFiles.upload.single("file"), async function (req, res) {
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

module.exports = userRouter;