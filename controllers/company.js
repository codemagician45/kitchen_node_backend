const multer = require("../images/multer");
var express = require("express");
var companyRouter = express.Router();
var passport = require("../passport2");
var auth = require("../middleware/verify");
const profiles = require("../models/companies_profiles");
const user = require("../models/users");

const { createMollieClient } = require("@mollie/api-client");

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
    let updateValues = req.body;
    updateValues = {
      ...updateValues,
      photo: req.file.filename + "." + mimeTypeToExtension[req.file.mimetype],
    };
    profiles
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

companyRouter.post("/offers", auth, multer.upload.none(), function (req, res) {
    console.log(req.session)
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
