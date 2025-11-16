'use client'
import BestSelling from "@/components/BestSelling";
import AllProducts from "@/components/AllProducts";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";

export default function Home() {
    return (
        <div>
            {/* <Hero /> */}
            <BestSelling />
            <AllProducts />
            {/* <LatestProducts /> */}
            <OurSpecs />
            {/* <Newsletter /> */}
        </div>
    );
}
