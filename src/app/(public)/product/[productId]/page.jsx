'use client'
import ProductDescription from "@/features/products/components/ProductDescription";
import ProductDetails from "@/features/products/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiFetch } from "@/services/apiClient";

export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState();
    const [loading, setLoading] = useState(true);
    const products = useSelector(state => state.product.list);

    const fetchProduct = async () => {
        // First try from Redux
        let foundProduct = products.find((product) => product.id === productId);
        if (foundProduct) {
            setProduct(foundProduct);
            setLoading(false);
            return;
        }

        // If not in Redux, fetch from API
        try {
            const response = await apiFetch(`/api/products/${productId}`);
            if (response.ok) {
                const data = await response.json();
                setProduct(data);
            } else {
                console.error('Product not found');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProduct();
        scrollTo(0, 0)
    }, [productId, products]);

    if (loading) {
        return <div>Loading product...</div>;
    }

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category}
                </div>

                {/* Product Details */}
                <ProductDetails product={product} />

                {/* Description & Reviews */}
                <ProductDescription product={product} />
            </div>
        </div>
    );
}