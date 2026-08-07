import gs_logo from "./gs_logo.jpg"
import upload_area from "./upload_area.svg"
import hero_model_img from "./hero_model_img.png"
import hero_product_img1 from "./hero_product_img1.png"
import hero_product_img2 from "./hero_product_img2.png"
import { ClockFadingIcon, HeadsetIcon, SendIcon } from "lucide-react";

// Note: assets that are unused or only ever imported-and-unused elsewhere in
// the app (product_img1-16.png, profile_pic*.jpg, happy_store.webp, and the
// superfoods/ folder) live in src/mock/assets/ instead — not real app assets,
// kept around only as leftover fixture material.
export const assets = {
    upload_area, hero_model_img,
    hero_product_img1, hero_product_img2, gs_logo,
}

export const categories = ["Headphones", "Speakers", "Watch", "Earbuds", "Mouse", "Decoration"];

export const ourSpecsData = [
    { title: "Free Shipping", description: "Enjoy fast, free delivery on every order no conditions, just reliable doorstep.", icon: SendIcon, accent: '#05DF72' },
    { title: "7 Days easy Return", description: "Change your mind? No worries. Return any item within 7 days.", icon: ClockFadingIcon, accent: '#FF8904' },
    { title: "24/7 Customer Support", description: "We're here for you. Get expert help with our customer support.", icon: HeadsetIcon, accent: '#A684FF' }
]