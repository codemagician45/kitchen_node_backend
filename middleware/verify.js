
const jwt = require('jsonwebtoken');
const URLCheck= [];

URLCheck["admin"]=[
    "/admin/dashboard/counts",
    "/admin/dashboard/companies",
    "/admin/dashboard/users",
    "/admin/offers",
    "/admin/dashboard/adminTestLoginAuth"
];
URLCheck["company"]=[
    "/companies/profile/password",
    "/companies/profile/upload",
    "/companies/pay",
    "/companies/offers",
    "/companies/becomeBidder"
];
URLCheck["client"]=[
    "/users/profile/password",
    "/users/profile/upload",
    "/users/offers"];



module.exports =async  (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, 'secret_key');
        if(URLCheck[decodedToken.cid].includes(req.originalUrl)==false){
            return res.status(401).send({
                message: 'Auth failed'
            });
        }

        req.userData=decodedToken
        next();
    }catch(error) {
        return res.status(401).send({
            message: 'Auth failed'
        });
    }
}