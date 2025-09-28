import { serve } from "inngest/next";
import { inngest, syncUserCreation, syncUserDeletion } from "@/config/inngest";


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserDeletion,
    syncUserDeletion
],
}); 