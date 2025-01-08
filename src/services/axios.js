import dotenv from "dotenv";
dotenv.config();

const botToken = process.env.TELEGRAM_TOKEN;

import fetch from "node-fetch";

const API_URL = `https://api.telegram.org/bot${botToken}/refundStarPayment`;

async function refundStarPayment(userId, telegramPaymentChargeId) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      telegram_payment_charge_id: telegramPaymentChargeId,
    }),
  });

  const data = await response.json();
  if (data.ok) {
    console.log("Refund successful:", data.result);
    return data.result;
  } else {
    console.error("Refund failed:", data.description);
  }
}

export { refundStarPayment };
