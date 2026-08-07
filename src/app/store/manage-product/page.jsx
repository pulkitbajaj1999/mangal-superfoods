'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/ui/Loading"
import { Edit, Trash2, X } from "lucide-react"
import { assets } from "@/assets/assets"
import { apiFetch } from "@/services/apiClient"

export default function StoreManageProducts() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [productToDelete, setProductToDelete] = useState(null)
    const [editImages, setEditImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [showViewModal, setShowViewModal] = useState(false)
    const [viewProduct, setViewProduct] = useState(null)

    const fetchProducts = async () => {
        try {
            const response = await apiFetch('/api/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }

    const toggleStock = async (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        try {
            const response = await apiFetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inStock: !product.inStock }),
            });
            if (response.ok) {
                // Update local state
                setProducts(products.map(p => p.id === productId ? { ...p, inStock: !p.inStock } : p));
            }
        } catch (error) {
            console.error('Error updating stock:', error);
            throw error;
        }
    }

    const handleView = (product) => {
        setViewProduct(product);
        setShowViewModal(true);
    }

    const handleEdit = (product) => {
        setSelectedProduct({ ...product });
        // Set up existing images for display
        const existingImages = { 1: null, 2: null, 3: null, 4: null };
        product.images?.forEach((img, index) => {
            if (index < 4) {
                existingImages[index + 1] = img;
            }
        });
        setEditImages(existingImages);
        setShowEditModal(true);
    }

    const handleDelete = (product) => {
        setProductToDelete(product);
        setShowDeleteConfirm(true);
    }

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            const response = await apiFetch(`/api/products/${productToDelete.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setProducts(products.filter(p => p.id !== productToDelete.id));
                toast.success('Product deleted successfully');
            } else {
                throw new Error('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        } finally {
            setShowDeleteConfirm(false);
            setProductToDelete(null);
        }
    }

    const handleSaveEdit = async () => {
        if (!selectedProduct) return;

        const formData = new FormData()
        const existingImages = []


        // 1. Separate existing URLs from new Files
        Object.keys(editImages).forEach(key => {
            const item = editImages[key];
            if (typeof item === 'string') {
                // This is an old image URL we want to keep
                existingImages.push(item);
            } else if (item instanceof File) {
                // This is a NEW file to be uploaded to S3
                formData.append('images', item);
            }
        });

        // 2. Append all other product data to FormData
        formData.append('name', selectedProduct.name);
        formData.append('description', selectedProduct.description);
        formData.append('mrp', selectedProduct.mrp);
        formData.append('price', selectedProduct.price);
        formData.append('category', selectedProduct.category);
        formData.append('inStock', selectedProduct.inStock);

        // Send the list of existing URLs as a JSON string
        formData.append('existingImages', JSON.stringify(existingImages));

        // // Handle image uploads
        // const imageUrls = [];
        
        // // Add existing images that weren't replaced
        // Object.keys(editImages).forEach(key => {
        //     if (editImages[key] && typeof editImages[key] === 'string') {
        //         imageUrls.push(editImages[key]);
        //     }
        // });
        
        // // Upload new images
        // for (const key of Object.keys(editImages)) {
        //     if (editImages[key] && typeof editImages[key] !== 'string') {
        //         // This is a new file to upload
        //         const formData = new FormData();
        //         formData.append('file', editImages[key]);
                
        //         try {
        //             // For now, create object URL as placeholder
        //             // In a real app, you'd upload to a cloud storage service
        //             imageUrls.push(URL.createObjectURL(editImages[key]));
        //         } catch (error) {
        //             console.error('Error uploading image:', error);
        //         }
        //     }
        // }

        try {
            const response = await apiFetch(`/api/products/${selectedProduct.id}`, {
                method: 'PUT',
                body: formData,
                // headers: { 'Content-Type': 'application/json' },
                // body: JSON.stringify({
                //     name: selectedProduct.name,
                //     description: selectedProduct.description,
                //     mrp: parseFloat(selectedProduct.mrp),
                //     price: parseFloat(selectedProduct.price),
                //     category: selectedProduct.category,
                //     inStock: selectedProduct.inStock,
                //     images: imageUrls.length > 0 ? imageUrls : selectedProduct.images,
                // }),
            });
            if (response.ok) {
                const updatedProduct = await response.json();
                setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
                toast.success('Product updated successfully');
                setShowEditModal(false);
                setSelectedProduct(null);
                setEditImages({ 1: null, 2: null, 3: null, 4: null });
            } else {
                throw new Error('Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product');
        }
    }

    const handleEditChange = (field, value) => {
        setSelectedProduct(prev => ({
            ...prev,
            [field]: value
        }));
    }

    const handleImageChange = (key, file) => {
        setEditImages(prev => ({
            ...prev,
            [key]: file
        }));
    }

    useEffect(() => {
            fetchProducts()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">Manage <span className="text-slate-800 font-medium">Products</span></h1>
            <table className="w-full max-w-4xl text-left  ring ring-slate-200  rounded overflow-hidden text-sm">
                <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 hidden md:table-cell">Description</th>
                        <th className="px-4 py-3 hidden md:table-cell">MRP</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {products.map((product) => (
                        <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => handleView(product)}>
                            <td className="px-4 py-3">
                                <div className="flex gap-2 items-center">
                                    <Image width={40} height={40} className='p-1 shadow rounded' src={product.images[0]} alt="" />
                                    {product.name}
                                </div>
                            </td>
                            <td className="px-4 py-3 max-w-md text-slate-600 hidden md:table-cell truncate">{product.description}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{currency} {product.mrp.toLocaleString()}</td>
                            <td className="px-4 py-3">{currency} {product.price.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                                <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toast.promise(toggleStock(product.id), { loading: "Updating data..." })} checked={product.inStock} />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <div className="flex gap-2 justify-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(product);
                                        }}
                                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit product"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(product);
                                        }}
                                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                        title="Delete product"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit Modal */}
            {showEditModal && selectedProduct && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold text-slate-800">Edit Product</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedProduct(null);
                                    setEditImages({ 1: null, 2: null, 3: null, 4: null });
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Product Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Product Images</label>
                                <div className="flex gap-3 flex-wrap">
                                    {Object.keys(editImages).map((key) => (
                                        <label key={key} htmlFor={`edit-images${key}`}>
                                            <Image 
                                                width={120} 
                                                height={120} 
                                                className='h-20 w-20 border border-slate-200 rounded cursor-pointer object-cover' 
                                                src={
                                                    editImages[key] 
                                                        ? (typeof editImages[key] === 'string' 
                                                            ? editImages[key] 
                                                            : URL.createObjectURL(editImages[key]))
                                                        : assets.upload_area
                                                } 
                                                alt="" 
                                            />
                                            <input 
                                                type="file" 
                                                accept='image/*' 
                                                id={`edit-images${key}`} 
                                                onChange={e => handleImageChange(key, e.target.files[0])} 
                                                hidden 
                                            />
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Click on images to replace them</p>
                            </div>

                            {/* Product Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        value={selectedProduct.name || ''}
                                        onChange={(e) => handleEditChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={selectedProduct.category || ''}
                                        onChange={(e) => handleEditChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={selectedProduct.description || ''}
                                    onChange={(e) => handleEditChange('description', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Price ({currency})</label>
                                    <input
                                        type="number"
                                        value={selectedProduct.mrp || ''}
                                        onChange={(e) => handleEditChange('mrp', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price ({currency})</label>
                                    <input
                                        type="number"
                                        value={selectedProduct.price || ''}
                                        onChange={(e) => handleEditChange('price', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="edit-inStock"
                                    checked={selectedProduct.inStock || false}
                                    onChange={(e) => handleEditChange('inStock', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="edit-inStock" className="ml-2 text-sm text-gray-700">In Stock</label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedProduct(null);
                                    setEditImages({ 1: null, 2: null, 3: null, 4: null });
                                }}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && productToDelete && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
                                    <p className="text-sm text-gray-500">Are you sure you want to delete this product?</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md mb-6">
                                <p className="text-sm font-medium text-gray-900">{productToDelete.name}</p>
                                <p className="text-sm text-gray-600">{currency} {productToDelete.price}</p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setProductToDelete(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && viewProduct && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold text-slate-800">Product Details</h2>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setViewProduct(null);
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Product Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Product Images</label>
                                <div className="flex gap-3 flex-wrap">
                                    {viewProduct.images?.map((image, index) => (
                                        <Image
                                            key={index}
                                            width={120}
                                            height={120}
                                            className='h-20 w-20 border border-slate-200 rounded object-cover'
                                            src={image}
                                            alt={`Product image ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">{viewProduct.name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">{viewProduct.category}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 whitespace-pre-wrap">{viewProduct.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Price</label>
                                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">{currency} {viewProduct.mrp?.toLocaleString()}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price</label>
                                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">{currency} {viewProduct.price?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="flex items-center">
                                    <div className={`w-4 h-4 rounded ${viewProduct.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="ml-2 text-sm text-gray-700">{viewProduct.inStock ? 'In Stock' : 'Out of Stock'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setViewProduct(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}