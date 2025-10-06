import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        console.log("=== Test Auth Debug ===");
        
        // Test auth()
        const authResult = auth();
        console.log("auth() result:", authResult);
        
        // Test currentUser()
        const clerkUser = await currentUser();
        console.log("currentUser() result:", clerkUser ? "User found" : "No user");
        
        // Check cookies
        const cookies = request.headers.get('cookie');
        console.log("Cookies present:", !!cookies);
        console.log("Cookie header:", cookies ? "Has cookies" : "No cookies");
        
        return NextResponse.json({
            success: true,
            auth: {
                hasAuth: !!authResult,
                userId: authResult?.userId,
                sessionId: authResult?.sessionId,
                orgId: authResult?.orgId,
                hasCurrentUser: !!clerkUser,
                clerkUserId: clerkUser?.id,
                clerkEmail: clerkUser?.emailAddresses?.[0]?.emailAddress,
                finalUserId: authResult?.userId || clerkUser?.id
            },
            cookies: {
                present: !!cookies,
                count: cookies ? cookies.split(';').length : 0
            }
        });
        
    } catch (error) {
        console.error("Test auth error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}