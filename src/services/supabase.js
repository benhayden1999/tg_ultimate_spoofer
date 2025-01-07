import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Function to get subscription status by user_id
 * @param {number} userId - The ID of the user
 * @returns {Promise<string|null>} - The subscription status or null if not found
 */
async function getSubscriptionStatus(userId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("user_id", userId)
      .single(); // Use .single() if you expect only one record

    if (error) {
      console.error("Error fetching subscription status:", error);
      return null;
    }

    if (!data) {
      console.warn(`No subscription status found for user_id: ${userId}`);
      return null;
    }

    console.log(`Subscription status for user_id ${userId}:`, data.status);
    return data.status;
  } catch (err) {
    console.error("Unexpected error fetching subscription status:", err);
    return null;
  }
}

async function addSubscription(
  userId,
  subscriptionExpirationDate,
  subscriptionChargeId,
  subscriptionAmount
) {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        user_id: userId,
        subscription_expiration_date: subscriptionExpirationDate,
        telegram_payment_charge_id: subscriptionChargeId,
        subscription_amount: subscriptionAmount,
        subscription_status: true,
      },
      { onConflict: ["user_id"] }
    )
    .single();
}

export { supabase, getSubscriptionStatus, addSubscription };
