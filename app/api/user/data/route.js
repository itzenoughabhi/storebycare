import connectDB from "@/config/db";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
    
    try {
        console.log("=== API Route Debug ===");
        
        // Try cookie-based authentication first
        const authResult = auth();
        let clerkUser = await currentUser();
        
        // Get userId from clerkUser if auth() doesn't provide it
        let userId = authResult?.userId || clerkUser?.id;
        
        console.log("Auth result:", authResult);
        console.log("Auth userId:", authResult?.userId);
        console.log("Clerk user ID:", clerkUser?.id);
        console.log("Final userId:", userId);
        console.log("Clerk user:", clerkUser ? "Found" : "Not found");
        
        // If we have clerkUser but no userId from auth(), use clerkUser.id
        if (clerkUser && !userId) {
            userId = clerkUser.id;
            console.log("Using clerkUser.id as userId:", userId);
        }
        
        // If still no user, try token-based auth
        if (!userId || !clerkUser) {
            const authHeader = request.headers.get('authorization');
            console.log("Trying token-based auth, header present:", !!authHeader);
            
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                try {
                    // Verify the session token
                    const session = await clerkClient.verifyToken(token);
                    userId = session.sub;
                    console.log("Token-based auth - userId:", userId);
                    
                    // Get user data from Clerk
                    clerkUser = await clerkClient.users.getUser(userId);
                    console.log("Token-based auth - user:", clerkUser ? "Found" : "Not found");
                } catch (tokenError) {
                    console.error("Token verification failed:", tokenError);
                }
            }
        }
        
        // Final check - do we have a user?
        if (!userId || !clerkUser) {
            console.log("Authentication failed completely");
            console.log("Final state - userId:", userId, "clerkUser:", !!clerkUser);
            return NextResponse.json({
                success: false, 
                message: "User not authenticated. Please sign in again.",
                debug: {
                    authResult: authResult,
                    authUserId: authResult?.userId,
                    clerkUserId: clerkUser?.id,
                    finalUserId: userId,
                    hasClerkUser: !!clerkUser
                }
            })
        }
        
        console.log("Authentication successful for user:", userId);
        
        await connectDB()

        let user = await User.findOne({ id: userId })
       
        console.log("User found in DB:", user ? "Yes" : "No");

        // If user doesn't exist, create them from Clerk data
        if (!user) {
            try {
                console.log("Creating user from Clerk data:", userId);
                
                const userData = {
                    id: userId,
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
                    email: clerkUser.emailAddresses?.[0]?.emailAddress || clerkUser.primaryEmailAddress?.emailAddress || '',
                    imageurl: clerkUser.imageUrl || clerkUser.profileImageUrl || '',
                    cartItem: {}
                };
                
                user = await User.create(userData);
                console.log("User created successfully");
            } catch (createError) {
                console.error("Error creating user:", createError);
                return NextResponse.json({
                    success: false, 
                    message: "Could not create user in database: " + createError.message
                })
            }
        }
        
        return NextResponse.json({success:true, user})

    } catch (error) {
         return NextResponse.json({success:false, message:error.message})
    }
}