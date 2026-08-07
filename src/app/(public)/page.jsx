'use client'
import BestSelling from "@/features/products/components/BestSelling";
import AllProducts from "@/features/products/components/AllProducts";
import Hero from "@/features/home/components/Hero";
import Newsletter from "@/features/home/components/Newsletter";
import OurSpecs from "@/features/home/components/OurSpec";
import LatestProducts from "@/features/products/components/LatestProducts";

export default function Home() {
    return (
        <div>
            {/* <Hero /> */}
            {/* <BestSelling /> */}
            <AllProducts />
            {/* <LatestProducts /> */}
            <OurSpecs />
            {/* <Newsletter /> */}
        </div>
    );
}
