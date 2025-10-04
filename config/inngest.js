import { Inngest } from "inngest";
import connectDB from "./db";
import User from "./models/User"; // Make sure this path is correct

// Create Inngest client
export const inngest = new Inngest({ id: "storebycare" });

/**
 * Sync User Creation (Clerk -> DB)
 */
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-created" }, // simple, unique ID
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
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
      console.log(`User created successfully: ${id}`);
    } catch (error) {
      console.error(`Error creating user: ${error.message}`);
      throw error; // Re-throw to mark function as failed
    }
  }
);

/**
 * Sync User Update (Clerk -> DB)
 */
export const syncUserUpdate = inngest.createFunction(
  { id: "sync-user-updated" }, // simple, unique ID
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const userdata = {
        name: `${first_name} ${last_name}`,
        email: email_addresses?.[0]?.email_address,
        imageurl: image_url
      };

      await connectDB();
      await User.findByIdAndUpdate(id, userdata, { new: true });
      console.log(`User updated successfully: ${id}`);
    } catch (error) {
      console.error(`Error updating user: ${error.message}`);
      throw error; // Re-throw to mark function as failed
    }
  }
);

/**
 * Sync User Deletion (Clerk -> DB)
 */
export const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deleted" }, // simple, unique ID
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const { id } = event.data;

      await connectDB();
      await User.findByIdAndDelete(id);
      console.log(`User deleted successfully: ${id}`);
    } catch (error) {
      console.error(`Error deleting user: ${error.message}`);
      throw error; // Re-throw to mark function as failed
    }
  }
);
