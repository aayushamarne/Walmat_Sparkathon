import React from "react";

const products = [
  {
    name: "Wireless Bluetooth Headphones",
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=200&fit=crop",
    rating: 4.5,
    price: 49.99,
    original: 79.99,
    stars: ["star", "star", "star", "star", "star_half"],
  },
  {
    name: "Programmable Coffee Maker",
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=200&fit=crop",
    rating: 5.0,
    price: 89.99,
    original: 119.99,
    stars: ["star", "star", "star", "star", "star"],
  },
  {
    name: "Ergonomic Office Chair",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop",
    rating: 4.2,
    price: 159.99,
    original: 199.99,
    stars: ["star", "star", "star", "star", "star_border"],
  },
  {
    name: "Running Sneakers",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop",
    rating: 4.8,
    price: 79.99,
    original: 99.99,
    stars: ["star", "star", "star", "star", "star"],
  },
];

const Featured = () => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <a
            href="#"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View All →
          </a>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow transform hover:scale-105"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {product.stars.map((star, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-sm"
                      >
                        {star}
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm ml-2">
                    ({product.rating})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">
                      ${product.price}
                    </span>
                    <span className="text-gray-500 line-through ml-2">
                      ${product.original}
                    </span>
                  </div>
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 px-4 py-2 rounded-full transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Featured;
