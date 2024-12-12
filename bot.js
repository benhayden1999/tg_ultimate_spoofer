import dotenv from "dotenv";
dotenv.config();
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Start the bot
bot.launch();
console.log("\x1b[35m\x1b[1mBot is running...\x1b[0m");

//_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*

console.log("what");
