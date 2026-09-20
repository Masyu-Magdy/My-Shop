"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const slides = [
  {
    title: "Shop smarter.\nLive better.",
    subtitle:
      "The latest arrivals, unbeatable prices, and delivery straight to your door.",
    cta: "Shop now",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "New season,\nnew style.",
    subtitle:
      "Fresh drops every week - curated collections picked just for you.",
    cta: "Explore collections",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Deals you\ncan't miss.",
    subtitle:
      "Up to 50% off a rotating selection of best-sellers, this week only.",
    cta: "See today's deals",
    href: "/products?sort=discount",
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1600&auto=format&fit=crop",
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      6000,
    );
    return () => clearInterval(timer);
  }, []);

  const slide = slides[index];

  return (
    <section className="relative mesh-bg text-white overflow-hidden">
      <div className=" max-w-7xl mx-auto px-4 py-14 md:py-28 grid md:grid-cols-2 items-center gap-10 min-h-[620px]">
        <div className=" order-2 md:order-2 ">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative z-10 "
            >
              <h1 className="text-4xl md:text-6xl font-extrabold whitespace-pre-line leading-[1.08]">
                {slide.title}
              </h1>
              <p className="text-white/80 max-w-md mt-5 text-lg">
                {slide.subtitle}
              </p>
              <Link
                href={slide.href}
                className="mt-8 inline-flex items-center gap-2 bg-white text-(--color-primary) font-bold px-7 py-3.5 rounded-full hover:scale-105 transition shadow-xl"
              >
                {slide.cta} <ArrowRight size={18} />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative order-1 md:order-2 md:block h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.92, rotate: 3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="float-slow absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
              style={{
                transform: "perspective(1000px) rotateY(-6deg) rotateX(3deg)",
              }}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                className="object-cover"
                priority
                sizes="600px"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-3 bg-white/40"}`}
          />
        ))}
      </div>

      <button
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center backdrop-blur"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center backdrop-blur"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>
    </section>
  );
}
