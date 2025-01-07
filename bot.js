import dotenv from "dotenv";
dotenv.config();
import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import fetch from "node-fetch"; // To download files from Telegram
import FormData from "form-data"; // To handle multipart/form-data
import fs from "fs"; // To manage temporary files
import path from "path"; // To handle file extensions
import {
  getSubscriptionStatus,
  addSubscription,
  getTrialUsedStatus,
  addJob,
} from "./src/services/supabase.js";
import { createInvoiceLink } from "./src/services/telegram.js";
// import {
//   sendMessage,
//   createInvoiceLink,
//   handleSuccessfulPayment,
//   replyWithButton,
// } from "./src/services/telegram.js";

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const price = process.env.SUBSCRIPTION_PRICE;

console.log("Price:", price);

// *_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_

bot.command("affiliate", async (ctx) => {
  ctx.reply(
    "👆Tap to bot profile and join affiliate. For all stars spent through this link you will receive *27%*🤑\n\n*▶️How to withdraw stars to cash?*\nCurrently only channels and bots can withdraw to TON Crypto and then Local Currency. Create a channel and when you're on the bit where you copy your link you can choose to have the stars sent to that channel. Withdraw to TON and then Cashola from there💸",
    { parse_mode: "Markdown" }
  );
});

bot.command("subscribe", async (ctx) => {
  try {
    const subscriptionStatus = await getSubscriptionStatus(ctx.from.id);
    if (subscriptionStatus === true) {
      await ctx.reply("You are already subscribed!");
    } else {
      const invoiceLink = await createInvoiceLink(price);
      console.log("Invoice Link:", invoiceLink);
      const text =
        "🔓 Get *unlimited* requests for *1 month*\n\n_Subscription will auto-renew, use the cancel command to cancel._";
      const buttonText = `Subscribe for ${price} ⭐️`;
      await ctx.reply(text, {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([Markup.button.url(buttonText, invoiceLink)]),
      });
    }
  } catch (error) {
    console.error("Error in subscribe command:", error);
    ctx.reply("An error occurred. Please try again later.");
  }
});

bot.command("cancelSubscription", async (ctx) => {
  ctx.reply(
    "*How to cancel subscription*\n\n1. Go to your profile in Telegram\n" +
      "2. My Stars\n" +
      "3. Find Bot under 'my subscriptions'\n" +
      "4. Cancel Subscription",
    { parse_mode: "Markdown" }
  );
});

bot.on(message("document"), async (ctx) => {
  console.log("Received a document message:", ctx.message.document.file_id);
  const subscriptionStatus = await getSubscriptionStatus(ctx.from.id);
  if (subscriptionStatus === true) {
    ctx.reply("📥 Downloading the file...");
  } else {
    const trialUsed = await getTrialUsedStatus(ctx.from.id);
    if (hasTrial === true) {
      ctx.reply("📥 Downloading the file...");
    } else {
      const invoiceLink = await createInvoiceLink(price);
      ctx.reply(
        "You have used your one free trial, you can get *unlimited requests* by subscribing.",
        {
          parse_mode: "Markdown",
          ...Markup.inlineKeyboard([
            Markup.button.url(`Subscribe for ${price} ⭐️`, invoiceLink),
          ]),
        }
      );
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
