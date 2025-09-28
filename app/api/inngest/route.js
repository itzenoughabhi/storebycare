import { serve } from "inngest/next";
import { inngest, syncUserCreation, syncUserUpdate, syncUserDeletion } from "@/config/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserUpdate,       // make sure to include all needed functions
    syncUserDeletion
  ],
});
import connectDB from "@/config/db";
connectDB(); // Ensure DB is connected when this module is loaded 