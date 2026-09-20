"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { productService, categoryService } from "@/services/product.service";
import ProductCard from "@/components/products/ProductCard";
import HeroSlider from "@/components/home/HeroSlider";
import TrustBadges from "@/components/home/TrustBadges";
import { ArrowRight, Sparkles, Mail } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  const { data: featured } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productService.getAll({ sort: "rating", limit: 8 }),
  });

  const { data: newArrivals } = useQuery({
    queryKey: ["products", "new"],
    queryFn: () => productService.getAll({ sort: "newest", limit: 4 }),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
  });

  return (
    <main>
      <HeroSlider />
      <TrustBadges />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-2xl md:text-3xl font-bold mb-1">Shop by category</h2>
          <p className="text-gray-500 mb-6">Find exactly what you're looking for.</p>
        </motion.div>
        <div className="flex gap-4 overflow-x-auto pb-2 py-6">
          {categories?.map((cat, i) => (
            <motion.div
              key={cat._id}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/products?category=${cat._id}`}
                className="tilt-card shrink-0 flex items-center gap-2 px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-semibold hover:border-(--color-primary) hover:text-(--color-primary) transition"
              >
                {cat.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Top rated</h2>
            <p className="text-gray-500 mt-1">Loved by thousands of happy customers.</p>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1 text-(--color-primary) text-sm font-semibold">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured?.items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 bg-white/15 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Sparkles size={13} /> Limited time
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold max-w-md">Up to 50% off best-sellers</h3>
            <p className="text-white/80 mt-2 max-w-sm">Don&apos;t miss this week&apos;s biggest deals across every category.</p>
          </div>
          <Link
            href="/products"
            className="relative z-10 shrink-0 bg-white text-emerald-700 font-bold px-7 py-3.5 rounded-full hover:scale-105 transition shadow-xl"
          >
            Shop the sale
          </Link>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        </motion.div>
      </section>

      {/* New Arrivals */}
      {!!newArrivals?.items?.length && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">New arrivals</h2>
              <p className="text-gray-500 mt-1">Just landed - be the first to shop them.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mesh-bg rounded-3xl text-white p-10 md:p-14 text-center"
        >
          <Mail size={32} className="mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl md:text-3xl font-extrabold">Get 10% off your first order</h3>
          <p className="text-white/80 mt-2 max-w-md mx-auto">Sign up for our newsletter and never miss a deal.</p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 max-w-md mx-auto flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-full px-5 py-3 text-gray-900 outline-none"
            />
            <button
              type="submit"
              className="bg-white text-(--color-primary) font-bold px-6 py-3 rounded-full hover:scale-105 transition"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
