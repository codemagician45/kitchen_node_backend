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
];
URLCheck["client"]=[
    "/users/profile/password",
    "/users/offers"];



module.exports = (req, res, next) => {
    try {

        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, 'secret_key');
        if(URLCheck[decodedToken.cid].includes(req.originalUrl)==false){
            return res.status(401).send({
                message: 'Auth failed'
            });
        }
        req.userData = decodedToken;

        next();
    }catch(error) {
        console.log(error)
        return res.status(401).send({
            message: 'Auth failed'
        });
    }
}