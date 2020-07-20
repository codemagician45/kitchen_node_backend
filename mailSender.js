/////mail creds
const nodemailer = require('nodemailer');
let mailTransporter = {
    service:"Gmail",
    auth: {
        user: 'asimmurat17@gmail.com',
        pass: '11_Murat_1105'
    }
}
////mail creds

/*
message =
 */

function mailSend(message) {
    let transport = nodemailer.createTransport(mailTransporter);
    let error = false;
    transport.sendMail(message, function (err, info) {
        if (err) {
            error = true
        } else {
            error = false
        }
    });
    return {
        mailSent : !error
    }
}
module.exports.mailSend = mailSend