
const user = require("./models/users");
const endpoint = require("./models/endpoints");

async function allow(req,res,next) {
    let userInfo = await user.findOne({
        where : {
            id : req.session.userId
        }
    })
    let userid=userInfo.id
    var Endpoint = endpoint;
    let ep= await Endpoint.findOne({ where:{path : req.originalUrl, userid : userid}},function (err,endpoint) {
        if(err || !endpoint){
            console.log("please DIE")
        }
    });
    if(!ep){
        res.sendStatus(401)
    }else{
        return next()
    }
}

async function sessionCheck(req,res,next){

    if(req.session){
        if(!req.session.userId){
            return res.sendStatus(401)
        }
        return next()
    }else{
        return res.sendStatus(401)
    }
}


module.exports.allow = allow
module.exports.isLoggedIn = sessionCheck