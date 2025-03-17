require('dotenv').config();
const { Telegraf } = require('telegraf');
const cron = require('node-cron');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = process.env.CHANNEL_ID;


const getDailyAnime = async () => {
    try {
        const response = await axios.get('https://api.jikan.moe/v4/random/anime');
        const anime = response.data.data;

        return {
            image: anime.images.jpg.image_url,
            title: `🌟 ${anime.title}\n\n`,
            message: `📖 *Synopsis:* ${anime.synopsis ? anime.synopsis.substring(0, 300) + '...' : 'No synopsis available.'}\n🎬 *Type:* ${anime.type}\n🗓 *Aired:* ${anime.aired.string}\n📺 *Episodes:* ${anime.episodes ?? 'Unknown'}\n⭐ *Rating:* ${anime.score ?? 'N/A'}\n\n🔗 [More Info](${anime.url})`,
            date: new Date().toLocaleString(),
            postedBy: 'Anime Otaku'
        };
    } catch (error) {
        console.error('Error fetching anime:', error.message);
        return null;
    }
};


cron.schedule('* * * * *', async () => {
    const data = await getDailyAnime();
    if (!data) return;
    const caption = `\n📢 *${data.title}*\n${data.message}\n📅 *Date:* ${data.date}\n👤 *Posted By:* ${data.postedBy}
    `;
    bot.telegram.sendPhoto(CHANNEL_ID, data.image, { caption, parse_mode: 'Markdown', disable_web_page_preview: true });
    console.log('Anime post sent:', data);
});

// cron.schedule('0 8 * * *', async () => {
//     const message = await getDailyData();
//     bot.telegram.sendMessage(CHANNEL_ID, message);
//     console.log('Message sent:', message);
// });


bot.launch();
console.log('Bot is running...');
