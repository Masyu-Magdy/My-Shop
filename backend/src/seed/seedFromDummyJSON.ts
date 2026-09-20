import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import mongoose from "mongoose";

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

async function seed() {
  await connectDB();

  const existingCount = await Product.countDocuments();
  if (existingCount > 0) {
    console.log(`⏭️  يوجد بالفعل ${existingCount} منتج في قاعدة البيانات. لن يتم الجلب من DummyJSON مرة أخرى.`);
    await mongoose.disconnect();
    return;
  }

  console.log("📦 جاري جلب المنتجات من DummyJSON (أول مرة فقط)...");

  const res = await fetch("https://dummyjson.com/products?limit=100");
  const data = (await res.json()) as { products: any[] };

  const uniqueCategories = [...new Set(data.products.map((p) => p.category))];
  const categoryMap = new Map<string, mongoose.Types.ObjectId>();

  for (const catName of uniqueCategories) {
    const slug = slugify(catName);
    const category = await Category.findOneAndUpdate(
      { slug },
      { name: catName, slug },
      { upsert: true, new: true }
    );
    categoryMap.set(catName, category._id as mongoose.Types.ObjectId);
  }

  const productsToInsert = data.products.map((p) => ({
    title: p.title,
    slug: `${slugify(p.title)}-${p.id}`,
    description: p.description,
    price: p.price,
    discountPercentage: p.discountPercentage || 0,
    category: categoryMap.get(p.category),
    brand: p.brand || "Generic",
    images: p.images || [p.thumbnail],
    thumbnail: p.thumbnail,
    stock: p.stock ?? 50,
    rating: p.rating || 0,
    isFeatured: Math.random() > 0.8,
    isActive: true,
  }));

  await Product.insertMany(productsToInsert);

  console.log(`✅ تم إدخال ${productsToInsert.length} منتج و ${uniqueCategories.length} تصنيف في MongoDB بنجاح.`);
  console.log("ℹ️  من هنا وصاعدًا التطبيق هيشتغل على MongoDB فقط، ومش هيرجع يجيب من DummyJSON تاني.");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ حصل خطأ أثناء عملية الـ Seeding:", err);
  process.exit(1);
});
