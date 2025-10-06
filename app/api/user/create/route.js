import connectDB from "@/config/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = auth()
        
        if (!userId) {
            return NextResponse.json({success: false, message: "Not authenticated"})
        }
        
        await connectDB()
        
        // Check if user already exists
        const existingUser = await User.findOne({ id: userId })
        if (existingUser) {
            return NextResponse.json({success: true, message: "User already exists", user: existingUser})
        }
        
        // Get user data from Clerk
        const clerkUser = await currentUser()
        
        if (!clerkUser) {
            return NextResponse.json({success: false, message: "Could not fetch user from Clerk"})
        }
        
        // Create user in database
        const userData = {
            id: clerkUser.id,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
            email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
            imageurl: clerkUser.imageUrl || '',
            cartItem: {}
        };
        
        const user = await User.create(userData);
        
        return NextResponse.json({success: true, message: "User created successfully", user})
        
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({success: false, message: error.message})
    }
}