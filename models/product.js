import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'user' }, // reference to User model
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    category: { type: String, required: true },
    images: [{ type: String, required: true }], // array of image URLs
    date: { type: Number, required: true },
});

const Product = mongoose.models.product || mongoose.model('product', productSchema);

export default Product;
