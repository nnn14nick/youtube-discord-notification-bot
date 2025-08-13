import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import Parser from 'rss-parser';

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const parser = new Parser();
let lastVideoId = null;

async function checkYouTubeRSS() {
    try {
        const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${process.env.YOUTUBE_CHANNEL_ID}`);
        if (!feed.items || feed.items.length === 0) return;

        const latestVideo = feed.items[0];
        const videoId = latestVideo.id.replace('yt:video:', '');
        const videoTitle = latestVideo.title;
        const videoLink = latestVideo.link;

        if (lastVideoId !== videoId) {
            lastVideoId = videoId;
            const channel = await client.channels.fetch(process.env.CHANNEL_ID);
            const customText = "ANY TEXT YOU WANT";

            await channel.send(`${customText} **${videoTitle}**\n${videoLink}`);
            console.log(`📢 New video: ${videoTitle}`);
        }
    } catch (err) {
        console.error("❌ Error fetching RSS feed:", err);
    }
}

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    checkYouTubeRSS();
    setInterval(checkYouTubeRSS, 5 * 60 * 1000); // every 5 minutes
});

client.login(process.env.BOT_TOKEN);
