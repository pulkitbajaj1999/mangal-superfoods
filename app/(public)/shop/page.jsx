'use client'
import { Suspense, useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { setProduct, setBestSelling } from "@/lib/features/product/productSlice"
import { apiFetch } from "@/lib/apiClient"

 function ShopContent() {

    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)

    // get query params ?search=abc
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    const products = useSelector(state => state.product.list)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiFetch('/api/products')
                if (response.ok) {
                    const data = await response.json()
                    dispatch(setProduct(data))
                    const bestSelling = data.slice().sort((a, b) => b.rating.length - a.rating.length).slice(0, 8)
                    dispatch(setBestSelling(bestSelling))
                }
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setLoading(false)
            }
        }

        if (products.length === 0) {
            fetchProducts()
        } else {
            setLoading(false)
        }
    }, [dispatch, products.length])

    const filteredProducts = search
        ? products.filter(product =>
            product.name.toLowerCase().includes(search.toLowerCase())
        )
        : products;

    if (loading) {
        return <div>Loading products...</div>
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className=" max-w-7xl mx-auto">
                <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"> {search && <MoveLeftIcon size={20} />}  All <span className="text-slate-700 font-medium">Products</span></h1>
                <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                    {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            </div>
        </div>
    )
}


export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}