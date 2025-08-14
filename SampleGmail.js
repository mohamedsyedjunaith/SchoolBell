const axios = require('axios');

const TELEGRAM_BOT_TOKEN = '8348800302:AAEs-fMtwcUebhTTzulFTE3k41MVsmTzbbE'; // Your bot token
const TELEGRAM_CHAT_ID = '2133372506'; // Your chat ID

async function sendTelegramMessage(text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: text
        });
        console.log('Message sent to Telegram');
    } catch (error) {
        console.error('Error sending Telegram message:', error.response ? error.response.data : error.message);
    }
}

// Example usage
sendTelegramMessage('Hello! Your timetable has been updated.');
