'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector, useDispatch } from 'react-redux'
import { setProduct, setBestSelling } from '../lib/features/product/productSlice'
import { apiFetch } from '../lib/apiClient'
import { useEffect, useState } from 'react'

const AllProducts = () => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const displayQuantity = 8
    const products = useSelector(state => state.product.list)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiFetch('/api/products')
                if (response.ok) {
                    const data = await response.json()
                    dispatch(setProduct(data))
                    // Set best selling as products with most ratings
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

    if (loading) {
        return <div>Loading products...</div>
    }

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='All Products' description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`} href='/shop' />
            <div className='mt-12  grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {products.slice().sort((a, b) => b.rating.length - a.rating.length).slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default AllProducts