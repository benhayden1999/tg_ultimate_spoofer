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
  addSubscription,
  getNumberOfJobs,
} from "./src/services/supabase.js";
// import {
//   sendMessage,
//   createInvoiceLink,
//   handleSuccessfulPayment,
//   replyWithButton,
// } from "./src/services/telegram.js";

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// *_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_

bot.command("subscribe", async (ctx) => {
  const subscriptionStatus = await getSubscriptionStatus(346345345);
  if (subscriptionStatus === true) {
    ctx.reply("You are already subscribed!");
  } else if (subscriptionStatus === false) {
    try {
      const invoiceLink = await 
});

bot.on(message("document"), async (ctx) => {
  console.log("Received a document message:", ctx.message.document.file_id);
  const subscriptionStatus = await getSubscriptionStatus(ctx.from.id);
  if (subscriptionStatus === true) {
    ctx.reply("📥 Downloading the file...");
  } else {
    const isTrial = await getNumberOfJobs(ctx.from.id);
    if (isTrial === true) {
      ctx.reply("📥 Downloading the file...");
    } else {
      ctx.reply("❌ You need to subscribe to download files.");
    }
  }
});

bot.on(message("text"), async (ctx) => {
  console.log("Received a text message:", ctx.message.text);
  const subscriptionStatus = await getSubscriptionStatus(ctx.from.id);
  console.log("Subscription status:", subscriptionStatus);
  const numberOfJobs = await getNumberOfJobs(ctx.from.id);
  console.log("Number of jobs:", numberOfJobs);
});

// When Not uploading as file
bot.on([message("photo"), message("video")], async (ctx) => {
  await ctx.reply(
    "😵 *Please send content from files and not gallery*\n\ntap *File* in bottom bar after 📎 \n\n_Reason: Preserves Metadata and quality",
    {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: "Markdown",
    }
  );
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

//pre-checkout query
bot.on("pre_checkout_query", async (ctx) => {
  ctx.answerPreCheckoutQuery(true);
});

// Handle successful payments
bot.on(message("successful_payment"), async (ctx) => {
  console.log("Received a successful payment:", ctx.message.successful_payment);
  ctx.reply("🎉 Thank you for your payment!");
  ctx.reply(ctx.message.successful_payment.subscription_expiration_date);

  await addSubscription(
    ctx.from.id,
    ctx.message.successful_payment.subscription_expiration_date,
    ctx.message.successful_payment.telegram_payment_charge_id,
    ctx.message.successful_payment.total_amount
  );
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
