const nodemailer = require('nodemailer');

const NODEMAILER_USER = process.env.NODEMAILER_USER;
const NODEMAILER_PASS = process.env.NODEMAILER_PASS;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: NODEMAILER_USER,
        pass: NODEMAILER_PASS
    },
});

const sendMail = ({ email, subject = "", text = "" }) => {
    return new Promise(async (resolve, reject) => {
        try {
            await transporter.sendMail({
                from: NODEMAILER_USER,
                to: email,
                subject,
                text,
            });
            return resolve(`Email sent successfully to ${email}`);
        } catch (e) {
            return reject(e);
        }
    });
};

module.exports = { sendMail };