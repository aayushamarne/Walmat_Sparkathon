import React from "react";

const categoryData = [
  { name: "Grocery", icon: "shopping_cart" },
  { name: "Electronics", icon: "laptop" },
  { name: "Home", icon: "home" },
  { name: "Fashion", icon: "checkroom" },
  { name: "Toys", icon: "toys" },
  { name: "Auto", icon: "directions_car" },
];

const Categories = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categoryData.map((category) => (
            <div
              key={category.name}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105"
            >
              <span className="material-symbols-outlined text-4xl text-blue-600 mb-3">
                {category.icon}
              </span>
              <h3 className="font-semibold">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
