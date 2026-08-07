'use client'
import { XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useSelector, useDispatch } from "react-redux"
import { addAddress } from '@/features/cart/addressSlice';
import { createAddress } from '@/features/cart/api/addressApi';

const AddressModal = ({ setShowAddressModal, onAddressAdded }) => {
    const dispatch = useDispatch()

    const user = useSelector(state => state.user.current);

    const [address, setAddress] = useState({
        name: '',
        mobile: '',
        pincode: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: ''
    })

    const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
        'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
        'Lakshadweep'
    ];

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!user) {
            toast.error('Please login to add address');
            return;
        }

        const addressData = {
            userId: user.id,
            ...address
        }

        try {
            const response = await createAddress(addressData)

            if (response.ok) {
                const newAddress = await response.json();
                toast.success('Address added successfully')
                // Dispatch to Redux
                dispatch(addAddress(newAddress));
                // Call callback to auto-select this address
                if (onAddressAdded) {
                    onAddressAdded(newAddress);
                }
                setShowAddressModal(false)
            } else {
                throw new Error('Failed to add address')
            }
        } catch (error) {
            console.error('Error adding address:', error)
            throw error
        }
    }

    return (
        <form onSubmit={e => toast.promise(handleSubmit(e), { loading: 'Adding Address...' })} className="fixed inset-0 z-50 bg-white/60 backdrop-blur h-screen flex items-center justify-center">
            <div className="flex flex-col gap-5 text-slate-700 w-full max-w-sm mx-6">
                <h2 className="text-3xl ">Add New <span className="font-semibold">Address</span></h2>
                
                <input 
                    name="name" 
                    onChange={handleAddressChange} 
                    value={address.name} 
                    className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
                    type="text" 
                    placeholder="Full name" 
                    required 
                />
                
                <input 
                    name="mobile" 
                    onChange={handleAddressChange} 
                    value={address.mobile} 
                    className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
                    type="tel" 
                    placeholder="Mobile number" 
                    required 
                />
                
                <input 
                    name="pincode" 
                    onChange={handleAddressChange} 
                    value={address.pincode} 
                    className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
                    type="text" 
                    placeholder="Pincode" 
                    required 
                />
                
                <input 
                    name="addressLine1" 
                    onChange={handleAddressChange} 
                    value={address.addressLine1} 
                    className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
                    type="text" 
                    placeholder="Flat, House no., Building, Company, Apartment" 
                    required 
                />
                
                <input 
                    name="addressLine2" 
                    onChange={handleAddressChange} 
                    value={address.addressLine2} 
                    className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
                    type="text" 
                    placeholder="Area, Street, Sector, Village" 
                    required 
                />
                
                <input 
                    name="landmark" 
                    onChange={handleAddressChange} 
                    value={address.landmark} 
                    className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
                    type="text" 
                    placeholder="Landmark (optional)" 
                />
                
                <input 
                    name="city" 
                    onChange={handleAddressChange} 
                    value={address.city} 
                    className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
                    type="text" 
                    placeholder="City" 
                    required 
                />
                
                <select 
                    name="state" 
                    onChange={handleAddressChange} 
                    value={address.state} 
                    className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
                    required
                >
                    <option value="">Select State</option>
                    {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>
                
                <button className="bg-slate-800 text-white text-sm font-medium py-2.5 rounded-md hover:bg-slate-900 active:scale-95 transition-all">SAVE ADDRESS</button>
            </div>
            <XIcon size={30} className="absolute top-5 right-5 text-slate-500 hover:text-slate-700 cursor-pointer" onClick={() => setShowAddressModal(false)} />
        </form>
    )
}

export default AddressModal