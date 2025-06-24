import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div>
            <h4 className="font-semibold mb-4">Get to Know Us</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-300 transition-colors">About Walmart</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">News</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Investors</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Make Money with Us</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-300 transition-colors">Sell on Walmart</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Become an Affiliate</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Advertise Your Products</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Walmart Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-300 transition-colors">Pharmacy</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Auto Care</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Photo Center</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Money Services</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Let Us Help You</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-300 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Your Orders</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-gray-300 transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect with Us</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="hover:text-blue-400 transition-colors"><i className="fa-brands fa-facebook text-2xl"></i></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><i className="fa-brands fa-twitter text-2xl"></i></a>
              <a href="#" className="hover:text-pink-400 transition-colors"><i className="fa-brands fa-instagram text-2xl"></i></a>
              <a href="#" className="hover:text-red-400 transition-colors"><i className="fa-brands fa-youtube text-2xl"></i></a>
            </div>
            <p className="text-sm">Download our app</p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">&copy; 2024 Walmart Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
