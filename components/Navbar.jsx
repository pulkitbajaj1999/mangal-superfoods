'use client'
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, setUser } from "@/lib/features/user/userSlice";

const Navbar = () => {

    const router = useRouter();
    const dispatch = useDispatch();

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)
    const user = useSelector(state => state.user.current)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const localUser = localStorage.getItem('store_user')
            if (localUser) {
                dispatch(setUser(JSON.parse(localUser)))
            }
        }
    }, [dispatch])

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all gap-16">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">Mangal </span>Superfoods<span className="text-green-600 text-5xl leading-0"></span>
                        {/* <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p> */}
                        <p className="py-1 text-xl text-slate-500"><span>Healthy Bites... </span>&nbsp;&nbsp;&nbsp;&nbsp;<span>Happy life...</span></p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600 flex-1">
                        {/* <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link> */}

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center flex-1 text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/contact">Contact</Link>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-2">
                                <p className="text-slate-600">Hi, {user.name}</p>
                                <Link href="/profile" className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-sm text-white rounded-full transition">
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('store_user')
                                        dispatch(logout())
                                    }}
                                    className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-sm text-white rounded-full transition"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                                    Login
                                </Link>
                                <Link href="/signup" className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-sm transition text-white rounded-full">
                                    Signup
                                </Link>
                            </div>
                        )}

                    </div>

                    {/* Mobile User Button  */}
                    <div className="sm:hidden">
                        {user ? (
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-slate-600">Hi, {user.name}</p>
                                <Link href="/profile" className="px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-xs text-white rounded-full transition">
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('store_user')
                                        dispatch(logout())
                                    }}
                                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-xs text-white rounded-full transition"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-xs transition text-white rounded-full">
                                    Login
                                </Link>
                                <Link href="/signup" className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-xs transition text-white rounded-full">
                                    Signup
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* <hr className="border-gray-300" /> */}
        </nav>
    )
}

export default Navbar