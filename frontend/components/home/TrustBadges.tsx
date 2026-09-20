import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const badges = [
  { icon: Truck, title: "Free shipping", desc: "On orders over $50" },
  { icon: ShieldCheck, title: "Secure payment", desc: "100% protected checkout" },
  { icon: RotateCcw, title: "Easy returns", desc: "30-day return window" },
  { icon: Headphones, title: "24/7 support", desc: "We're always here to help" },
];

export default function TrustBadges() {
  return (
    <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
      <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
        {badges.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3 p-5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-(--color-primary) flex items-center justify-center shrink-0">
              <Icon size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
