import { Telegraf } from "telegraf";
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const price = process.env.SUBSCRIPTION_PRICE;

// Function to create an invoice link
async function createInvoiceLink(price) {
  const invoice = {
    title: "1 Month Subscription",
    description: "Unlimited Spoof Requests for 1 month",
    payload: "subscription_payload",
    provider_token: "",
    currency: "XTR",
    prices: [{ label: "Subscription", amount: price }], // amount in cents
  };

  try {
    const link = await bot.telegram.createInvoiceLink(invoice);
    return link;
  } catch (error) {
    console.error("Error creating invoice link:", error);
    throw error;
  }
}

export { createInvoiceLink };
