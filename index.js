var express = require("express");
const { google } = require("googleapis");
var bodyParser = require("body-parser");
const session = require("express-session");
var md5 = require("md5");
var jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");
var path = require('path');
var fs = require('fs');
const StreamChat = require('stream-chat').StreamChat;

var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
const multer = require("./images/multer");

const cors = require("cors");
app.use(cors());

const user = require("./models/users");
const profile = require("./models/user_profiles");
const company_profile = require("./models/companies_profiles");

const google_credentials = require("./google_cred.json");

const mailSender = require("./mailSender");

const userController = require("./controllers/user");
const adminOfferController = require("./controllers/adminOffer");
const companyController = require("./controllers/company");
const widgetController = require("./controllers/widget");
const googleController = require("./controllers/google");
const adminDashboardController = require("./controllers/adminDashboard");
const { response } = require("express");

app.use(
  session({
    secret: "key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/google", googleController);
app.use("/admin/dashboard", adminDashboardController);
app.use("/admin/offers", adminOfferController);
app.use("/users", userController);
app.use("/widget", widgetController);
app.use("/companies", companyController);
app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/uploaded_files'));

const client = new OAuth2Client(google_credentials.web.client_id);

app.listen(3100, function () {
  console.log("Yayın portu : 3100");
  app.get("/", function (req, res) {
    res.send("<h1>Merhabe</h1> Express");
  });

  app.post("/login", multer.upload.none(), async function (req, res) {
    let userInfo = await user.findOne({
      where: { email: req.body.email, password: md5(req.body.password) },
    });
    if (userInfo) {
      const token = jwt.sign(
        {
          muuid: userInfo.id,
          memail: userInfo.email,
          cid: userInfo.type,
        },
        "secret_key",
        {
          expiresIn: "2h",
        }
      );
      res.send({
        login: true,
        token: token,
        user: userInfo,
      });
    } else {
      res.status(401).send({
        error: "uw wachtwoord of gebruikersnaam zijn niet correct.",
        login: false,
      });
    }
  });

  app.post("/googlelogin", multer.upload.none(), async (req, res) => {
    const { tokenId } = req.body;
    client
      .verifyIdToken({
        idToken: tokenId,
        audience: google_credentials.web.client_id,
      })
      .then(async (response) => {
        const { email_verified, name, email } = response.payload;

        if (email_verified) {
          let userInfo = await user.findOne({ where: { email: email } });
          if (userInfo) {
            const token = jwt.sign(
              {
                muuid: userInfo.id,
                memail: userInfo.email,
                cid: userInfo.type,
              },
              "secret_key",
              {
                expiresIn: "2h",
              }
            );
            res.send({
              login: true,
              token: token,
              user: userInfo,
            });
          } else {
            user
              .create({
                email: email,
                type: "client",
              })
              .then((newUser) => {
                const token = jwt.sign(
                  {
                    muuid: newUser.id,
                    memail: newUser.email,
                    cid: newUser.type,
                  },
                  "secret_key",
                  {
                    expiresIn: "2h",
                  }
                );
                profile.create({
                  users_id: newUser.id,
                });
                res.send({
                  success: true,
                  login: true,
                  token: token,
                  user: newUser,
                });
              })
              .catch((err) => {
                res.send({
                  success: false,
                  reason: err.name,
                });
              });
          }
        } else {
          res
            .status(401)
            .send({ error: "Something went wrong...", login: false });
        }
      });
  });

  app.post("/facebooklogin", multer.upload.none(), async function (request, response) {
    const { userID, accessToken } = request.body;

    let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
    fetch(urlGraphFacebook, {
      method: "GET",
    })
      .then((res) => res.json())
      .then(async (res) => {
        const { email, name } = res;
        let userInfo = await user.findOne({ where: { email: email } });
        if (userInfo) {
          const token = jwt.sign(
            {
              muuid: userInfo.id,
              memail: userInfo.email,
              cid: userInfo.type,
            },
            "secret_key",
            {
              expiresIn: "2h",
            }
          );
          response.send({
            login: true,
            token: token,
            user: userInfo,
          });
        } else {
          user
            .create({
              email: email,
              type: "client",
            })
            .then((newUser) => {
              const token = jwt.sign(
                {
                  muuid: newUser.id,
                  memail: newUser.email,
                  cid: newUser.type,
                },
                "secret_key",
                {
                  expiresIn: "2h",
                }
              );
              profile.create({
                users_id: newUser.id,
              });
              response.send({
                success: true,
                login: true,
                token: token,
                user: newUser,
              });
            })
            .catch((err) => {
              res.send({
                success: false,
                reason: err.name,
              });
            });
        }
      });
  });
  app.get("/mailSent", multer.upload.none(), function (req, res) {
    let mailResult = mailSender.mailSend({
      from: "asimmurat17@gmail.com",
      to: "asimmurat17@gmail.com",
      subject: "Design Your Model S | Tesla",
      text: "Have the most fun you can in a car. Get your Tesla today!",
    });
    res.send(mailResult);
  });
  /* WIP */

  app.post("/register", multer.upload.none(),async function (req, res) {
    console.log(req.body);
    const client = new StreamChat('kkzn98xebx9t', '7npmqra3csw3enwakqg2teek6tr9uyfzx2ex7zaw5txagcj7rs7rduc9z7n2cs74');
    user.create({
        email: req.body.email,
        password: md5(req.body.password),
        type: "client",
      })
      .then( async (newUser)=> {
        const token = client.createToken(newUser.id.toString());
        await client.setUser(
            {
              id: newUser.id.toString(),
              name: req.body.email,
            },
            token,
        ).then((userData)=>{
          console.log(userData)
          console.log(token)
          user.update({message_token:token}, { where: { id: parseInt(userData.me.id)} }).then((result) => {
                  let success=false;
                  if(result==1){
                      success=true
                  }
              });

              profile.create({
                  users_id: newUser.id,
                });
                res.send({
                  success: true,
                  user: newUser,
                });
              })
          }).catch((err) => {
           console.log(err)
             res.send({
              success: false,
              reason: err.name,
            });
          });
  });

  app.post("/companies_register", multer.upload.single("photo"), function (req, res) {
      let profilesPhoto = req.file.filename;
      const client = new StreamChat('kkzn98xebx9t', '7npmqra3csw3enwakqg2teek6tr9uyfzx2ex7zaw5txagcj7rs7rduc9z7n2cs74');
      req.body.companyInfo=JSON.parse(req.body.companyInfo)
      user.create({
              email: req.body.email,
              password: md5(req.body.password),
              type: "company",
          }).then(async (newUser) => {
          const token = client.createToken(newUser.id.toString());
          await client.setUser(
              {
                  id: newUser.id.toString(),
                  name: req.body.email,
              },
              token,
          ).then((userData)=>{
              console.log(userData)
              console.log(token)
              user.update({message_token:token}, { where: { id: parseInt(userData.me.id)} }).then((result) => {
                  let success=false;
                  if(result==1){
                      success=true
                  }
                  req.body.companyInfo.photo=profilesPhoto
                  req.body.companyInfo.users_id=userData.me.id
                  company_profile.create(req.body.companyInfo);
                  res.send({
                      success: true,
                      user: newUser,
                  });

              });
              })
          }).catch((err) => {
              console.log(err)
              res.send({
                  success: false,
                  reason: err.name,
              });
      })
          .catch((err) => {
              res.send({
                  success: false,
                  reason: err.name,
              });
          });
  });

  app.post("/download",multer.upload.none(),function(req,res){
      var filePath = path.join(__dirname, req.body.file);
      res.download(filePath);
  })

  app.post("/logout", multer.upload.none(), function (req, res) {
    req.session.destroy();
    res.end();
  });

});
