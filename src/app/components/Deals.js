import React from "react";

const deals = [
  {
    title: "Flash Sale",
    label: "50% OFF",
    description: "Limited time offer on electronics",
    from: "red-500",
    to: "red-600",
    text: "red-600",
  },
  {
    title: "Buy 2 Get 1",
    label: "FREE",
    description: "On selected home & garden items",
    from: "green-500",
    to: "green-600",
    text: "green-600",
  },
  {
    title: "Clearance",
    label: "70% OFF",
    description: "End of season clothing sale",
    from: "purple-500",
    to: "purple-600",
    text: "purple-600",
  },
];

const Deals = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Special Offers</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r from-${deal.from} to-${deal.to} text-white rounded-lg p-6 hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{deal.title}</h3>
                <span
                  className={`bg-white text-${deal.text} px-3 py-1 rounded-full text-sm font-semibold`}
                >
                  {deal.label}
                </span>
              </div>
              <p className="mb-4 opacity-90">{deal.description}</p>
              <button
                className={`bg-white text-${deal.text} px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors`}
              >
                Shop Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Deals;
