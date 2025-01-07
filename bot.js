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
  getGpsCoords,
  SetGpsCoords,
} from "./src/services/supabase.js";
import { createInvoiceLink } from "./src/services/telegram.js";
// import { handleDocumentWorkflow } from "./src/services/downloads.js";

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const price = process.env.SUBSCRIPTION_PRICE;

console.log("Price:", price);

// *_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_

bot.command("setcoords", async (ctx) => {
  ctx.reply(
    "*Send the coordinates where you want the photos to appear as taken from.*\n\nClick the 📎 icon and select 'Location' from the bottom bar.\n\nℹ️ _We will save this location for you. To update it, simply send a new location._",
    { parse_mode: "Markdown" }
  );
});

bot.on(message("location"), async (ctx) => {
  const latitude = ctx.message.location.latitude;
  const longitude = ctx.message.location.longitude;
  await SetGpsCoords(ctx.from.id, latitude, longitude);
  await ctx.telegram.unpinAllChatMessages(ctx.chat.id);
  ctx
    .reply(`📍 Location saved: ${latitude}, ${longitude}`)
    .then((sentMessage) => {
      ctx.telegram.pinChatMessage(ctx.chat.id, sentMessage.message_id);
    });
});

bot.command("checkcoords", async (ctx) => {
  const coords = await getGpsCoords(ctx.from.id);
  if (coords === null) {
    ctx.reply(
      "*You have no coordinates saved.*\n\nℹ️ For help use /setcoords.",
      {
        parse_mode: "Markdown",
      }
    );
  } else {
    ctx.replyWithLocation(coords.latitude, coords.longitude);
    ctx.reply("If you need to change the coordinates, send another location.");
  }
});

bot.on(message("document"), async (ctx) => {
  try {
    const fileId = ctx.message.document.file_id;
    const originalFileName = document.file_name;
    const fileSize = document.file_size;
    const userId = ctx.from.id; // To ensure uniqueness

    console.log(
      `User ${userId} sent a file: ${originalFileName} (${fileSize} bytes)`
    );

    // 1. Validate file size (max 9.99 MB)
    if (fileSize > 9.99 * 1024 * 1024) {
      await ctx.reply(
        "❌ The file is too large. Maximum allowed size is 10MB."
      );
      return;
    }
    // 2) Hand off to the workflow in workflow.js
    const gpsCoords = await getGPSLocation(userId);
    await handleDocumentWorkflow(ctx, {
      fileId,
      originalFileName,
    });
  } catch (error) {
    console.error("Error handling document:", error);
    await ctx.reply("❌ An error occurred while processing your document.");
  }
});

bot.command("affiliate", async (ctx) => {
  ctx.reply(
    "🔗*Go to this bot's profile and join 'affiliate program' from there. For all stars spent through your link you will receive* *27%*🤑\n\n\n*▶️How to withdraw stars to cash?*\n\n1. *Commission sent to your personal account*\n_Personal accounts cannot withdraw star balances, they can only spend stars within Telegram... option 2 however;_\n\n2. *Commission sent to a channel you own*\n_Channels can withdraw to TON Crypto and from there to Local Currency.  So if you want to withdraw to the real world create a channel and set commission to go to this channel when when generating your affiliate link._",
    { parse_mode: "Markdown" }
  );
});

bot.command("start", async (ctx) => {
  ctx.reply("click /subscribe to get started");
});

bot.command("subscribe", async (ctx) => {
  try {
    const subscriptionStatus = await getSubscriptionStatus(4353453);
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
