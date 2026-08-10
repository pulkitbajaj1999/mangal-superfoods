'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/ui/Loading"
import { ImageIcon, RefreshCw } from "lucide-react"
import { getOrders, updateOrderStatus as updateOrderStatusApi } from "@/features/orders/api/orderApi"
import { getProductImageSrc } from "@/features/products/utils/productImage"

export default function StoreOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [refreshingOrderId, setRefreshingOrderId] = useState(null)
    const [sortBy, setSortBy] = useState('date')
    const [currentPage, setCurrentPage] = useState(1)
    const ordersPerPage = 10


    const fetchOrders = async () => {
        try {
            const response = await getOrders();
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
                setCurrentPage(1);
            } else {
                throw new Error('Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }

    const getSortedOrders = () => {
        const sorted = [...orders];
        if (sortBy === 'customer') {
            sorted.sort((a, b) => (a.user?.name || '').localeCompare(b.user?.name || ''));
        } else if (sortBy === 'status') {
            sorted.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
        } else if (sortBy === 'date') {
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return sorted;
    }

    const sortedOrders = getSortedOrders();
    const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const paginatedOrders = sortedOrders.slice(startIndex, startIndex + ordersPerPage);

    const updateOrderStatus = async (orderId, status) => {
        try {
            setRefreshingOrderId(orderId);
            const response = await updateOrderStatusApi(orderId, status);

            if (response.ok) {
                // Update the local state
                setOrders(orders.map(order => 
                    order.id === orderId ? { ...order, status } : order
                ));
                // Update selected order if it's open
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status });
                }
            } else {
                throw new Error('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        } finally {
            setRefreshingOrderId(null);
        }
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl text-slate-500">Store <span className="text-slate-800 font-medium">Orders</span></h1>
                <div className="flex items-center gap-3">
                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring focus:ring-blue-200"
                    >
                        <option value="date">Sort by: Date (Latest)</option>
                        <option value="customer">Sort by: Customer Name</option>
                        <option value="status">Sort by: Status</option>
                    </select>
                    <button 
                        onClick={fetchOrders}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>
            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <>
                    <div className="overflow-x-auto max-w-4xl rounded-md shadow border border-gray-200">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                                <tr>
                                    {["Sr. No.", "Customer", "Phone", "Total", "Payment", "Coupon", "Status", "Date"].map((heading, i) => (
                                        <th key={i} className="px-4 py-3">{heading}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedOrders.map((order, index) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                        onClick={() => openModal(order)}
                                    >
                                        <td className="pl-6 text-green-600" >
                                            {startIndex + index + 1}
                                        </td>
                                        <td className="px-4 py-3">{order.user?.name}</td>
                                        <td className="px-4 py-3">{order.address?.mobile}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">₹{order.total}</td>
                                        <td className="px-4 py-3">{order.paymentMethod}</td>
                                        <td className="px-4 py-3">
                                            {order.isCouponUsed ? (
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                                    {order.coupon?.code}
                                                </span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className="px-4 py-3" onClick={(e) => { e.stopPropagation() }}>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={order.status}
                                                    onChange={e => updateOrderStatus(order.id, e.target.value)}
                                                    className="border-gray-300 rounded-md text-sm focus:ring focus:ring-blue-200"
                                                    disabled={refreshingOrderId === order.id}
                                                >
                                                    <option value="ORDER_PLACED">ORDER_PLACED</option>
                                                    <option value="PROCESSING">PROCESSING</option>
                                                    <option value="SHIPPED">SHIPPED</option>
                                                    <option value="DELIVERED">DELIVERED</option>
                                                </select>
                                                {refreshingOrderId === order.id && (
                                                    <RefreshCw size={16} className="animate-spin text-blue-600" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {Math.min(startIndex + ordersPerPage, sortedOrders.length)} of {sortedOrders.length} orders
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded text-sm ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Modal */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black/50 text-slate-700 text-sm backdrop-blur-xs z-50" >
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
                            Order Details
                        </h2>

                        {/* Customer Details */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Customer Details</h3>
                            <p><span className="text-green-700">Name:</span> {selectedOrder.user?.name}</p>
                            <p><span className="text-green-700">Email:</span> {selectedOrder.user?.email}</p>
                            <p><span className="text-green-700">Phone:</span> {selectedOrder.address?.mobile}</p>
                            <p><span className="text-green-700">Address:</span> {`${selectedOrder.address?.addressLine1}, ${selectedOrder.address?.addressLine2}${selectedOrder.address?.landmark ? ', ' + selectedOrder.address.landmark : ''}, ${selectedOrder.address?.city}, ${selectedOrder.address?.state}, ${selectedOrder.address?.pincode}`}</p>
                        </div>

                        {/* Products */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Products</h3>
                            <div className="space-y-2">
                                {(selectedOrder.orderItems || []).map((item, i) => {
                                    const imageSrc = getProductImageSrc(item.product);
                                    return (
                                    <div key={i} className="flex items-center gap-4 border border-slate-100 shadow rounded p-2">
                                        {imageSrc ? (
                                            <img
                                                src={imageSrc}
                                                alt={item.product?.name || 'product image'}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 flex items-center justify-center bg-slate-100 text-slate-400 rounded">
                                                <ImageIcon size={20} />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-slate-800">{item.product?.name}</p>
                                            <p>Qty: {item.quantity}</p>
                                            <p>Price: ${item.price}</p>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Payment & Status */}
                        <div className="mb-4">
                            <p><span className="text-green-700">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                            <p><span className="text-green-700">Paid:</span> {selectedOrder.isPaid ? "Yes" : "No"}</p>
                            {selectedOrder.isCouponUsed && (
                                <p><span className="text-green-700">Coupon:</span> {selectedOrder.coupon.code} ({selectedOrder.coupon.discount}% off)</p>
                            )}
                            <p><span className="text-green-700">Status:</span> {selectedOrder.status}</p>
                            <p><span className="text-green-700">Total:</span> ₹{selectedOrder.total}</p>
                            <p><span className="text-green-700">Order Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end">
                            <button onClick={closeModal} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300" >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
