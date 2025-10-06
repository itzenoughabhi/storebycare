'use client'
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import {  useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";

import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()
    const { user } = useUser();
  const { getToken } = useAuth(); // Capital T


    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})



    const fetchProductData = async () => {
        setProducts(productsDummyData)
    }

    const fetchUserData = async () => {
        try {
            // Check if user is properly loaded from Clerk
            if (!user || !user.id) {
                console.log("User not ready yet, skipping fetch");
                return;
            }

            if (user?.publicMetadata?.role === "seller") {
                setIsSeller(true)
            }

            console.log("Fetching user data for:", user.id);

            // Always get the token and send it with the request
            const token = await getToken();
            console.log("Got token:", !!token);
            
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            const { data } = await axios.get('/api/user/data', { headers })
            console.log("API Response:", data);
            
            if (data.success) {
                setUserData(data.user)
                setCartItems(data.user.cartItem || {})
            } else {
                console.log("API Error:", data.message);
                console.log("Debug info:", data.debug);
                toast.error(data.message)
            }


        } catch (error) {
            console.error("Fetch user data error:", error);
            console.error("Error response:", error.response?.data);
            toast.error(error.response?.data?.message || error.message)
        }
    }

    const addToCart = async (itemId) => {

        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);

    }

    const updateCartQuantity = async (itemId, quantity) => {

        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData)

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if (user) {
            fetchUserData()
        }

    }, [user])

    const value = {
        user,getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}