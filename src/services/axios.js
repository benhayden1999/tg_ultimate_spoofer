import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import fetch from "node-fetch";

const botToken = process.env.TELEGRAM_TOKEN;
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

async function sendDocumentWithAxios(ctx, filePath) {
  const form = new FormData();
  form.append("chat_id", ctx.chat.id);
  form.append("document", fs.createReadStream(filePath));
  form.append("reply_to_message_id", ctx.message.message_id.toString());

  // Hardcoded caption
  const caption = "🪄 Nice iPhone pic Bro.";
  form.append("caption", caption);
  form.append("parse_mode", "HTML");

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendDocument`,
      form,
      {
        headers: form.getHeaders(),
        timeout: 120000, // Set the timeout to 120 seconds
      }
    );
    return true;
  } catch (error) {
    console.error("Error sending file with axios:", error);
    return false;
  } finally {
    // Cleanup: Remove the file after sending
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

export { refundStarPayment, sendDocumentWithAxios };
