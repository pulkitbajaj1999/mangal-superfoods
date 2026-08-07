'use client'
import Banner from "@/components/layout/Banner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({ children }) {

    return (
        <>
            {/* <Banner /> */}
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
