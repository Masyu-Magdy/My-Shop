import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#18122B] text-gray-300 mt-0">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
        <div>
          <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
            MyShop
          </span>
          <p className="text-gray-400 mt-3 leading-relaxed">
            Your first stop for online shopping - the best prices, curated products, fast delivery.
          </p>
          <div className="flex gap-3 mt-4">
            <Instagram size={16} className="text-gray-400 hover:text-white transition cursor-pointer" />
            <Twitter size={16} className="text-gray-400 hover:text-white transition cursor-pointer" />
            <Facebook size={16} className="text-gray-400 hover:text-white transition cursor-pointer" />
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Shop</h4>
          <ul className="space-y-2">
            <li><Link href="/products" className="hover:text-white transition">All products</Link></li>
            <li><Link href="/wishlist" className="hover:text-white transition">Wishlist</Link></li>
            <li><Link href="/profile/orders" className="hover:text-white transition">Track an order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Policies</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-white transition">Privacy policy</Link></li>
            <li><Link href="/" className="hover:text-white transition">Terms of service</Link></li>
            <li><Link href="/" className="hover:text-white transition">Returns policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Get in touch</h4>
          <p className="text-gray-400">support@shoply.com</p>
          <p className="text-gray-400 mt-1">Mon-Fri, 9am-6pm</p>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 py-5 border-t border-white/10">
        © {new Date().getFullYear()} Shoply. All rights reserved.
      </div>
    </footer>
  );
}
