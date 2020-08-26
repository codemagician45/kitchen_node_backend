/////mail creds
const nodemailer = require('nodemailer');
let mailTransporter = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'asimmurat17@gmail.com',
        pass: '11_Murat_1105'
    }
    /*service:"Gmail",
    auth: {
        user: 'asimmurat17@gmail.com',
        pass: '11_Murat_1105'
    }
    */
}

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