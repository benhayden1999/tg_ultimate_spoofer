import dotenv from "dotenv";
dotenv.config();
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import fetch from "node-fetch"; // To download files from Telegram
import FormData from "form-data"; // To handle multipart/form-data
import fs from "fs"; // To manage temporary files
import path from "path"; // To handle file extensions
import {
  getSubscriptionStatus,
  getSubscriptionPlans,
} from "./src/services/supabase.js";

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.on(message("text"), async (ctx) => {
  console.log("Received a text message:", ctx.message.text);
  ctx.reply("Hello! Send me a document to rename it.");
  getSubscriptionStatus(ctx.from.id);
  getSubscriptionPlans();
});

// Handle document uploads using the modern message filter
bot.on(message("document"), async (ctx) => {
  try {
    const document = ctx.message.document;
    const fileId = document.file_id;
    const originalFileName = document.file_name;
    const fileSize = document.file_size;
    const userId = ctx.from.id; // To ensure uniqueness

    console.log(
      `User ${userId} sent a file: ${originalFileName} (${fileSize} bytes)`
    );

    // 1. Validate file size (max 9.99 MB)
    if (fileSize > 9.99 * 1024 * 1024) {
      await ctx.reply(
        "❌ The file is too large. Maximum allowed size is 9.99 MB."
      );
      return;
    }

    // ...existing code...
  } catch (error) {
    console.error("Error handling document:", error);
    await ctx.reply("❌ An error occurred while processing your document.");
  }
});

// Start the bot
bot
  .launch()
  .then(() => {
    console.log("Bot is running...");
  })
  .catch((error) => {
    console.error("Failed to launch bot:", error);
  });
