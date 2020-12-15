/////mail creds
const nodemailer = require('nodemailer');
const mail_queries = require("./models/mail_queries");

let mailTransporter = {
    host: 'mail.keukenvergelijking.nl',
    port: 465,
    secure: true,
    auth: {
        user: 'klantenservice@keukenvergelijking.nl',
        pass: 'Klanten2020@'
    }
}
function format_mail(mailText){
    let format_mail_header= "<html>";
    let format_mail_end = "</html>";
    return format_mail_header+mailText+format_mail_end;
}
async function mail(mail,subject,html) {

    let transport = nodemailer.createTransport(mailTransporter);
    let error = false;
    let mail_queries_result = await mail_queries.create({
        mail:mail,
        subject:subject,
        html:format_mail(html),
        is_sent:0,
    })
}

async function runQuery(){
    let mails= await mail_queries.findAll({where:{"is_sent":0}})
    mails.forEach(async mail=>{
        console.log(mail)
        mailSend({
            from: mailTransporter.auth.user,
            to: mail.mail,
            subject: mail.subject,
            html: "<html>"+mail.html+"</html>",
        });
        await mail_queries.update({is_sent:1},{where:{id:mail.id}})
    })
}


function mailSend(message) {

    let transport = nodemailer.createTransport(mailTransporter);
    let error = false;
    transport.sendMail(message, function (err, info) {
        if (err) {
            return console.log("hatali ",err);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
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



module.exports.mail = mail
module.exports.runQuery = runQuery
module.exports.mailConfig = mailTransporter