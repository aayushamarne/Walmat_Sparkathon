import React from "react";

const perks = [
  {
    title: "Free Shipping",
    description: "Free shipping on orders over $35 or pickup in-store",
    icon: "local_shipping",
  },
  {
    title: "2-Day Delivery",
    description: "Get your items delivered in just 2 days with Walmart+",
    icon: "schedule",
  },
  {
    title: "Easy Returns",
    description: "Free returns within 90 days on most items",
    icon: "assignment_return",
  },
];

const Perks = () => {
  return (
    <section className="bg-blue-600 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {perks.map((perk, index) => (
            <div
              key={index}
              className="bg-white/10 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-4xl mb-4 block">
                {perk.icon}
              </span>
              <h3 className="text-xl font-semibold mb-2">{perk.title}</h3>
              <p className="opacity-90">{perk.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Perks;
