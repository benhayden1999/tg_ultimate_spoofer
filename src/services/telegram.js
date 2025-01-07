import { Telegraf } from "telegraf";
import dotenv from "dotenv";
dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Example function to send a message
async function sendMessage(chatId, text, options = {}) {
  try {
    await bot.telegram.sendMessage(chatId, text, options);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// Example function to create an invoice link
async function createInvoiceLink(invoiceDetails) {
  try {
    const invoiceLink = await bot.telegram.createInvoiceLink({
      title: "Subscribe",
      description: "Unlimited requests",
      payload: "test",
      provider_token: "", // Pass an empty string for payments in Telegram Stars
      currency: "XTR",
      prices: [{ label: "Subscribe", amount: 1 }],
      subscription_period: 2592000, // 30 days in seconds
    });
    return invoiceLink;
  } catch (error) {
    console.error("Error creating invoice link:", error);
    return null;
  }
}

// Example function to reply with a message containing a button and button link
async function replyWithButton(ctx, text, buttonText, buttonUrl) {
  try {
    await ctx.reply(
      text,
      Markup.inlineKeyboard([Markup.button.url(buttonText, buttonUrl)])
    );
  } catch (error) {
    console.error("Error replying with button:", error);
  }
}

// Example function to handle successful payments
async function handleSuccessfulPayment(ctx) {
  try {
    console.log(
      "Received a successful payment:",
      ctx.message.successful_payment
    );
    await ctx.reply("🎉 Thank you for your payment!");
    // Add additional logic here, e.g., updating subscription status
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

export {
  bot,
  sendMessage,
  createInvoiceLink,
  replyWithButton,
  handleSuccessfulPayment,
};
