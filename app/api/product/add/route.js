import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import Product from "@/models/product"; // Make sure you have a Product model
import authSeller from "../../../../lib/authSeller";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function POST(request) {
    try {
        // Get the user ID from Clerk
        const { userId } = getAuth(request);

        // Check if the user is a seller
        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return new Response(
                JSON.stringify({ success: false, message: "Not authorized" }),
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const category = formData.get("category");
        const price = formData.get("price");
        const offerPrice = formData.get("offerPrice");
        const files = formData.getAll("images");

        if (!files || files.length === 0) {
            return new Response(
                JSON.stringify({ success: false, message: "No files uploaded" }),
                { status: 400 }
            );
        }

        // Upload images to Cloudinary
        const uploadedImages = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: "auto" },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    stream.end(buffer);
                });
            })
        );

        const imageUrls = uploadedImages.map((res) => res.secure_url);

        // Connect to DB
        await connectDB();

        // Create new product
        const newProduct = await Product.create({
            userId,
            name,
            description,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            image: imageUrls,
            date: Date.now(),
        });

        return new Response(
            JSON.stringify({ success: true, message: "Product added successfully", newProduct }),
            { status: 201 }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { status: 500 }
        );
    }
}
