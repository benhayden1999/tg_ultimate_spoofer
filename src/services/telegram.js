import { Telegraf } from "telegraf";
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Function to create an invoice link
async function createSubscriptionLink(price) {
  const invoice = {
    title: "1 Month Unlimited Subscription",
    description: "Unlimited Requests",
    payload: "subscription_payload",
    provider_token: "",
    currency: "XTR",
    subscription_period: 2592000,
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

// Function to create an invoice link
async function createInvoiceLink(price, fileId) {
  const invoice = {
    title: "Individual Request",
    description: "Run an individual request",
    payload: fileId,
    provider_token: "",
    currency: "XTR",
    prices: [{ label: "Individual Item", amount: price }], // amount in cents
  };

  try {
    const link = await bot.telegram.createInvoiceLink(invoice);
    return link;
  } catch (error) {
    console.error("Error creating invoice link:", error);
    throw error;
  }
}

export { createSubscriptionLink, createInvoiceLink };
