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
      if (error.code === "PGRST116") {
        console.log(`No subscription status found for user_id: ${userId}`);
        return false; // Indicate that the user does not have a subscription
      }
      console.error("Error fetching subscription status:", error);
      return null;
    }

    if (data.subscription_status === true) {
      console.log(`Subscription status is true for user_id: ${userId}`);
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error("Unexpected error fetching subscription status:", err);
    return null;
  }
}

async function getNumberOfJobs(userId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("number_jobs")
      .eq("user_id", userId)
      .single(); // Use .single() if you expect only one record

    if (error) {
      if (error.code === "PGRST116") {
        console.log(`No number of jobs found for user_id: ${userId}`);
        return false; // Indicate that the user does not have any jobs
      }
      console.error("Error fetching number of jobs:", error);
      return null;
    }

    if (data.number_jobs < 1) {
      console.log(`Number of jobs is less than 1 for user_id: ${userId}`);
      return false;
    } else {
      console.log(`Number of jobs is 1 or more for user_id: ${userId}`);
      return true;
    }
  } catch (err) {
    console.error("Unexpected error fetching number of jobs:", err);
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

export { supabase, getSubscriptionStatus, addSubscription, getNumberOfJobs };
