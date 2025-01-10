import dotenv from "dotenv";
dotenv.config();
import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import {
  getSubscriptionStatus,
  addSubscription,
  hasTrial,
  removeFreeTrial,
  getGpsCoords,
  setGpsCoords,
} from "./src/services/supabase.js";
import {
  createSubscriptionLink,
  createInvoiceLink,
} from "./src/services/telegram.js";
import { processContent } from "./src/services/processing.js";
import {
  refundStarPayment,
  sendDocumentWithAxios,
} from "./src/services/axios.js";

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const subscriptionPrice = process.env.SUBSCRIPTION_PRICE;
const itemPrice = process.env.ITEM_PRICE;

// *_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_

bot.command("start", async (ctx) => {
  const content = `<b>😵‍💫This bot will add 'iPhone-like' metadata, including GPS coordinates, to your content.</b>\n\n<b>Why?</b>\n<blockquote expandable><b>1. Target specific locations 🌍</b>\n\n<span class="tg-spoiler">By adding GPS coordinates, you can control where your content gets promoted. Without GPS metadata, the algorithm might distribute your post randomly (e.g., 20% USA, 20% India, 40% China, 20% UK). With location-specific metadata, the algorithm focuses on your target audience. For example, you can ensure your content reaches English-speaking or wealthy regions, improving engagement and relevance.</span></blockquote>\n\n<blockquote expandable><b>2. Bypass AI re-upload detection 🤖</b>\n\n<span class="tg-spoiler">Platforms use AI to detect re-uploaded content, but they start with metadata checks because it’s the fastest and cheapest method. Advanced image recognition requires significant computational resources, so if your metadata mimics genuine iPhone uploads, your content is far less likely to be flagged. Instead, it often gets overlooked, allowing it to bypass these checks. By adding convincing metadata, the platform is more likely to assume you’re the original creator and push your content further.</span></blockquote>\n\n<blockquote expandable><b>3. Algorithms favor authentic content ✅</b>\n\n<span class="tg-spoiler">Platforms prioritize content they perceive as genuine. Photos or videos with iPhone-like metadata appear authentic, which makes them more likely to be promoted by the algorithm. Authentic metadata signals to the platform that the content is original and worth pushing to more users.</span></blockquote>\n\n<blockquote expandable><b>4. Lower risk of account bans 🔒</b>\n\n<span class="tg-spoiler">When pushing content aggressively, there’s always a risk of being flagged as spam. Metadata that appears authentic makes your account look like it belongs to a real user rather than a bot. Platforms are less likely to flag or ban accounts with legitimate-looking metadata, giving you a safer way to grow your content reach.</span></blockquote>`;
  await ctx.reply(content, { parse_mode: "HTML" });
});

bot.command("virality", async (ctx) => {
  const content = `<b>😵‍💫This bot will add 'iPhone-like' metadata, including GPS coordinates, to your content.</b>\n\n<b>Why?</b>\n<blockquote expandable><b>1. Target specific locations 🌍</b>\n\n<span class="tg-spoiler">By adding GPS coordinates, you can control where your content gets promoted. Without GPS metadata, the algorithm might distribute your post randomly (e.g., 20% USA, 20% India, 40% China, 20% UK). With location-specific metadata, the algorithm focuses on your target audience. For example, you can ensure your content reaches English-speaking or wealthy regions, improving engagement and relevance.</span></blockquote>\n\n<blockquote expandable><b>2. Bypass AI re-upload detection 🤖</b>\n\n<span class="tg-spoiler">Platforms use AI to detect re-uploaded content, but they start with metadata checks because it’s the fastest and cheapest method. Advanced image recognition requires significant computational resources, so if your metadata mimics genuine iPhone uploads, your content is far less likely to be flagged. Instead, it often gets overlooked, allowing it to bypass these checks. By adding convincing metadata, the platform is more likely to assume you’re the original creator and push your content further.</span></blockquote>\n\n<blockquote expandable><b>3. Algorithms favor authentic content ✅</b>\n\n<span class="tg-spoiler">Platforms prioritize content they perceive as genuine. Photos or videos with iPhone-like metadata appear authentic, which makes them more likely to be promoted by the algorithm. Authentic metadata signals to the platform that the content is original and worth pushing to more users.</span></blockquote>\n\n<blockquote expandable><b>4. Lower risk of account bans 🔒</b>\n\n<span class="tg-spoiler">When pushing content aggressively, there’s always a risk of being flagged as spam. Metadata that appears authentic makes your account look like it belongs to a real user rather than a bot. Platforms are less likely to flag or ban accounts with legitimate-looking metadata, giving you a safer way to grow your content reach.</span></blockquote>`;
  await ctx.reply(content, { parse_mode: "HTML" });
});

bot.command("setlocation", async (ctx) => {
  ctx.reply(
    "<b>🗺️ Send a location where you want the content to appear as taken from.</b>\n\nClick the 📎 icon and see 'location' in the bottom bar.\n\n<blockquote expandable><b>How adding location helps?</b>\n\n1. Posts are more likely to be pushed to people in that location.  You can target high income countries like USA, UAE etc.\n\n2. Your account is less likely to get banned as it's assumed you're posting raw content taken on an iPhone - not copied, AI etc. This gives your account more trust in the algorithm and it will be less likely to be flagged.</blockquote>",
    { parse_mode: "HTML" }
  );
});

bot.on(message("location"), async (ctx) => {
  const latitude = ctx.message.location.latitude;
  const longitude = ctx.message.location.longitude;
  const gpsCoordsSet = await setGpsCoords(ctx.from.id, latitude, longitude);
  if (gpsCoordsSet) {
    await ctx.telegram.unpinAllChatMessages(ctx.chat.id);
    ctx
      .reply(`📍 Location saved: ${latitude}, ${longitude}`)
      .then((sentMessage) => {
        ctx.telegram.pinChatMessage(ctx.chat.id, sentMessage.message_id);
      });
    ctx.reply("Now you can send in a photo file");
  } else {
    ctx.reply("An error occurred while saving the location. Please try again.");
  }
});

bot.command("checklocation", async (ctx) => {
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

bot.command("affiliate", async (ctx) => {
  ctx.reply(
    "<b>Go to this bot's profile and join 'affiliate program' from there. For all stars spent through your link you will receive</b> <b>27%🤑</b>\n\n<blockquote expandable><b>How to withdraw Stars to cash?</b>\n\n<b>TLDR</b>\nWhen getting your affiliate link choose to send Stars commission to a channel you own and not your personal.\n\n<b>1. Commission sent to your personal account</b>\nPersonal accounts cannot withdraw star balances, they can only spend stars within Telegram... <b>option 2 however;</b>\n\n2. <b>Commission sent to a channel you own</b>\nChannels can withdraw to TON Crypto and from there to Local Currency.  So if you want to withdraw to the real world create a channel and set commission to go to this channel when when generating your affiliate link.<b>TLDR</b>\nWhen getting your affiliate link choose to send Stars commission to a channel you own and not your personal.\n\n🤫How to get stars ~35% cheaper through telegrams other company /fragment.</blockquote>",
    { parse_mode: "HTML" }
  );
});

bot.command("fragment", async (ctx) => {
  ctx.reply(
    `<b>Get Telegram Stars ~30% off</b>\n\n1. Load up on some TON (Telegrams Crypto) using a wallet (the easiest to set up is <a href="https://tonkeeper.com/">TON Keeper</a> ~2min setup).\n\n2. Once you've got some TON in your wallet go to <a href="https://fragment.com/">Fragment</a> and buy Stars from there.\n\n<blockquote>This is because you're not buying through apple and androids App Stores which charges 30% per transaction.</blockquote>`,
    { parse_mode: "HTML", disable_web_page_preview: true }
  );
  ctx.deleteMessage(ctx.message.message_id);
  s;
});

bot.command("subscription", async (ctx) => {
  try {
    const subscriptionStatus = await getSubscriptionStatus(45345345);
    if (subscriptionStatus === true) {
      await ctx.reply(
        "You are already subscribed!\n<i>/cancelsubscription</i>",
        { parse_mode: "HTML" }
      );
    } else {
      const invoiceLink = await createSubscriptionLink(subscriptionPrice);
      const buttonText = `Subscribe for ${subscriptionPrice} ⭐️`;
      await ctx.reply(
        "🔓 Get <b>unlimited</b> requests for <b>1 month</b>\n\n<i>Subscription will auto-renew monthly.\n/cancelsubscription any time.</i>",
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: buttonText,
                  url: invoiceLink,
                },
              ],
            ],
          },
        }
      );
      ctx.deleteMessage(ctx.message.message_id);
    }
  } catch (error) {
    console.error("Error in subscribe command:", error);
    ctx.reply("An error occurred. Please try again later.");
  }
});

bot.command("cancelsubscription", async (ctx) => {
  ctx.reply(
    "*How to cancel subscription*\n\n1. Go to your profile in Telegram\n" +
      "2. My Stars\n" +
      "3. Find Bot under 'my subscriptions'\n" +
      "4. Cancel Subscription",
    { parse_mode: "Markdown" }
  );
  ctx.deleteMessage(ctx.message.message_id);
});

//_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*

// Check size and content type
bot.on(message("document"), async (ctx, next) => {
  const fileSize = ctx.message.document.file_size;
  const contentType = ctx.message.document.mime_type.split("/")[0];
  if (fileSize > 10 * 1024 * 1024 || contentType !== "image") {
    await ctx.reply(
      "❌ Unsupported file type. Please upload images only that are under 10Mb."
    );
    ctx.deleteMessage(ctx.message.message_id);
    return;
  }
  next();
});

// 1. Check if they have Coords
bot.on(message("document"), async (ctx, next) => {
  const coords = await getGpsCoords(ctx.from.id);
  if (!coords) {
    await ctx.reply(
      "📍 <b>First set a location</b>\n\nClick the 📎 icon and select 'Location' from the bottom bar.\n\n<blockquote>ℹ️ We will save this location for you. To update it, simply send a new location.</blockquote>",
      { parse_mode: "HTML" }
    );
    console.log("No coords set");
    return;
  }
  ctx.coords = coords; // Attach hasCoords to ctx
  next();
});

// 2. Check if user has subscription
bot.on(message("document"), async (ctx, next) => {
  const subscriptionStatus = await getSubscriptionStatus(ctx.from.id);

  if (subscriptionStatus) {
    const fileId = ctx.message.document.file_id;
    const coords = ctx.coords;
    const iPhoneFilePath = await processContent(ctx, fileId, coords);

    await ctx.telegram.sendChatAction(ctx.chat.id, "upload_photo");

    const success = await sendDocumentWithAxios(ctx, iPhoneFilePath);
    if (!success) {
      await ctx.reply(
        "❌ An error occurred while sending your file. Please try again."
      );
    }
    return;
  }
  next(); // Pass control to the next middleware
});

// 3. Check if user has trial
bot.on(message("document"), async (ctx, next) => {
  const trialStatus = await hasTrial(ctx.from.id);
  console.log("User has trial:", trialStatus);
  if (trialStatus) {
    const fileId = ctx.message.document.file_id;
    const coords = ctx.coords;
    const iPhoneFilePath = await processContent(ctx, fileId, coords);
    await ctx.telegram.sendChatAction(ctx.chat.id, "upload_photo");
    const success = await sendDocumentWithAxios(ctx, iPhoneFilePath);
    if (!success) {
      await ctx.reply(
        "❌ An error occurred while sending your file. Please try again."
      );
    }
    await removeFreeTrial(ctx.from.id);
    return;
  }
  next(); // Pass control to the next middleware
});

/// Send payment options
bot.on(message("document"), async (ctx) => {
  const fileId = ctx.message.document.file_id;
  const invoiceLink = await createInvoiceLink(itemPrice, fileId);
  const subscriptionLink = await createSubscriptionLink(subscriptionPrice);

  await ctx.reply(
    "<b>Choose an option</b>\n\n<i>With-Pay-Per-Request you will be paying for the file that is being replied to above. Send another file if you don't want that one.</i>",
    {
      parse_mode: "HTML",
      reply_to_message_id: ctx.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `${itemPrice} ⭐️ Pay Per Request`,
              url: invoiceLink,
            },
          ],
          [
            {
              text: `${subscriptionPrice} ⭐️ Unlimited Subscription`,
              url: subscriptionLink,
            },
          ],
        ],
      },
    }
  );
});
//_*_*_*_*_*_*_*_*_*_*_*_**_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*

// When Not uploading as file
bot.on([message("photo"), message("video")], async (ctx) => {
  await ctx.reply(
    "😵 *Please send content from files and not gallery*\n\nTap *File* in bottom bar after 📎\n\nℹ️ _Reason: Preserves metadata and quality_",
    {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: "Markdown",
    }
  );
  ctx.deleteMessage(ctx.message.message_id);
});

//pre-checkout query
bot.on("pre_checkout_query", async (ctx) => {
  ctx.answerPreCheckoutQuery(true);
});

// Payment successful
bot.on(message("successful_payment"), async (ctx) => {
  if (ctx.message.successful_payment.is_recurring) {
    const subAdded = await addSubscription(
      ctx.from.id,
      ctx.message.successful_payment.subscription_expiration_date,
      ctx.message.successful_payment.telegram_payment_charge_id,
      ctx.message.successful_payment.total_amount
    );
    if (subAdded) {
      ctx.reply(
        "🎉 Thank you! Your subscription is now active. You have unlimited requests!"
      );
    } else {
      ctx.reply(
        "An error occurred while processing your subscription. We will also refund you now."
      );
      await refundStarPayment(
        ctx.from.id,
        ctx.message.successful_payment.telegram_payment_charge_id
      );
    }
  } else {
    //handling individual payment
    const fileId = ctx.message.successful_payment.invoice_payload;
    const coords = await getGpsCoords(ctx.from.id);
    const iPhoneFilePath = await processContent(ctx, fileId, coords);
    await ctx.telegram.sendChatAction(ctx.chat.id, "upload_photo");
    const success = await sendDocumentWithAxios(ctx, iPhoneFilePath);
    if (!iPhoneFilePath || !success) {
      await ctx.reply(
        "An error occurred while processing your file. We will refund you, but please try again."
      );
      await refundStarPayment(
        ctx.from.id,
        ctx.message.successful_payment.telegram_payment_charge_id
      );
    }
    return;
  }
});

bot.on("message", async (ctx) => {
  await ctx.reply("Please send an image as a file and we'll do the rest.");
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
