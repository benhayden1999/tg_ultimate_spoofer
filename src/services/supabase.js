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

async function hasTrial(userId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("has_free_trial")
      .eq("user_id", userId)
      .single(); // Use .single() if you expect only one record

    if (error) {
      if (error.code === "PGRST116") {
        console.log("user has a free trial");
        return true; // Indicate that the user does not have any jobs
      }
      console.error("Error fetching number of jobs:", error);
      return null;
    }

    if (data.has_free_trial === false) {
      console.log("user hasn't got a free trial");
      return false;
    } else {
      console.log("user has got the trial");
      return true;
    }
  } catch (err) {
    console.error("Unexpected error fetching trial status of jobs:", err);
    return null;
  }
}

async function addSubscription(
  userId,
  subscriptionExpirationDate,
  subscriptionChargeId,
  subscriptionAmount
) {
  try {
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

    if (error) {
      throw error;
    }

    console.log("Subscription added successfully:", data);
    return true;
  } catch (error) {
    console.error("Error adding subscription:", error);
    return false;
  }
}

async function removeFreeTrial(userId) {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        user_id: userId,
        has_free_trial: false,
      },
      { onConflict: ["user_id"] }
    )
    .single();
}

async function getGpsCoords(userId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("latitude, longitude")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        console.log(`No such user: ${userId}`);
        return false;
      }
      console.error("Error fetching subscription status:", error);
      return null;
    }

    if (data.latitude === null || data.longitude === null) {
      return false;
    }
    console.log(data);
    return data;
  } catch (err) {
    console.error("Error fetching GPS coordinates:", err);
    return null;
  }
}

async function setGpsCoords(userId, latitude, longitude) {
  try {
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          user_id: userId,
          latitude: latitude,
          longitude: longitude,
        },
        { onConflict: ["user_id"] }
      )
      .single();

    if (error) {
      throw error;
    }

    console.log("GPS coordinates set successfully:", data);
    return true;
  } catch (error) {
    console.error("Error setting GPS coordinates:", error);
    return false;
  }
}

export {
  supabase,
  getSubscriptionStatus,
  addSubscription,
  hasTrial,
  removeFreeTrial,
  getGpsCoords,
  setGpsCoords,
};
