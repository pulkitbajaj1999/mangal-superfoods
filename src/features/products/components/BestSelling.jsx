'use client'
import Title from '@/components/ui/Title'
import ProductCard from './ProductCard'
import { useSelector, useDispatch } from 'react-redux'
import { setBestSelling } from '@/features/products/productSlice'
import { apiFetch } from '@/services/apiClient'
import { useEffect, useState } from 'react'

const BestSelling = () => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const displayQuantity = 8
    const products = useSelector(state => state.product.bestSelling)
    const allProducts = useSelector(state => state.product.list)

    useEffect(() => {
        const fetchBestSelling = async () => {
            if (allProducts.length > 0) {
                const bestSelling = allProducts.slice().sort((a, b) => b.rating.length - a.rating.length).slice(0, 8)
                dispatch(setBestSelling(bestSelling))
                setLoading(false)
            } else {
                // If no products, fetch all
                try {
                    const response = await apiFetch('/api/products')
                    if (response.ok) {
                        const data = await response.json()
                        const bestSelling = data.slice().sort((a, b) => b.rating.length - a.rating.length).slice(0, 8)
                        dispatch(setBestSelling(bestSelling))
                    }
                } catch (error) {
                    console.error('Error fetching products:', error)
                } finally {
                    setLoading(false)
                }
            }
        }

        if (products.length === 0) {
            fetchBestSelling()
        } else {
            setLoading(false)
        }
    }, [dispatch, products.length, allProducts])

    if (loading) {
        return <div>Loading best selling...</div>
    }

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Best Selling' description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`} href='/shop' />
            <div className='mt-12  grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {products.slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling