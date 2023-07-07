const axios = require('axios');
const constants = require('./constants');

const util = {};

util.sendTelegram = async function (message, sChatId = constants.TELEGRAM_CHAT_ID.CALLLINK_INQUIRER_FORM, sMode = '') {
    try {
        const sUrl = `https://api.telegram.org/bot5887156644:AAH11dJ-Z8IaeV6UMB1tBSj5Ylz4MUw6gQs/sendMessage?chat_id=${sChatId}&text=${encodeURI(message)}&parse_mode=${sMode}`;
        await axios.get(sUrl);
        console.log('[sendTelegram][success]');
    } catch (error) {
        console.error(`[sendTelegram][error]`);
    }
}


module.exports = util;
