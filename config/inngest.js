import { Inngest } from "inngest";
import connectDB from "./db";
import User from "./models/User"; // <-- make sure you import your User model

// Create a client to send and receive events
export const inngest = new Inngest({ id: "storebycare" });

/**
 * Sync User Creation (Clerk -> DB)
 */
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userdata = {
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_addresses?.[0]?.email_address,
      imageurl: image_url,
      cartItem: {}
    };

    await connectDB();
    await User.create(userdata);
  }
);

/**
 * Sync User Update (Clerk -> DB)
 */
export const syncUserUpdate = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userdata = {
      name: `${first_name} ${last_name}`,
      email: email_addresses?.[0]?.email_address,
      imageurl: image_url
    };

    await connectDB();
    await User.findByIdAndUpdate(id, userdata, { new: true });
  }
);

/**
 * Sync User Deletion (Clerk -> DB)
 */
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    await connectDB();
    await User.findByIdAndDelete(id);
  }
);
