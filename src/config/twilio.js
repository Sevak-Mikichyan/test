const twilio = require('twilio');

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const sendSMS = async (to, message) => {
    try {
        const response = await client.messages.create({
            body: message,
            from: TWILIO_PHONE_NUMBER,
            to,
        });

        console.log('Հաղորդագրությունը հաջողությամբ ուղարկվեց:', response.sid);
    } catch (error) {
        console.error('Սխալ հաղորդագրություն ուղարկելու ժամանակ:', error);
    }
}

module.exports = { sendSMS };