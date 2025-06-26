'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useProduct } from '../../../hooks/useProduct';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const CLOUDINARY_UPLOAD_PRESET = 'tryllect';
const CLOUDINARY_CLOUD_NAME = 'dlil6t6m4';

const INITIAL_PRODUCT_DATA = {
  product_id: '',
  name: '',
  category: '',
  brand: '',
  description: '',
  price: { original: 0, discounted: 0, currency: 'INR' },
  type: 'clothing',
  variants: [{ 
    variant_id: '', 
    color: '', 
    size: '', 
    storage: '', 
    image: '', 
    stock: 0 
  }],
  clothing_attributes: {
    fabric: '',
    skin_compatibility: { skin_types: '', skin_tones: '' },
    ar_tryon: { model_3d_url: '', instructions: '', pose_required: '' }
  },
  electronics_attributes: {
    processor: '', 
    ram: '', 
    storage: '', 
    battery: '', 
    display: '', 
    warranty: '', 
    connectivity: []
  },
  images: { main: '', gallery: [] }
};

const CATEGORIES = ['Shirts', 'Jeans', 'Mobiles', 'Laptops'];
const BRANDS = ['Apple', 'Samsung', 'Nike', 'Zara'];
const CLOTHING_SIZES = ['S', 'M', 'L', 'XL'];
const ELECTRONIC_SIZES = ['11 inch', '13 inch', '15.6 inch', '17 inch'];
const COLORS = ['Red', 'Blue', 'Black', 'White'];
const SKIN_TYPES = ['Oily', 'Dry', 'Normal', 'Combination'];
const SKIN_TONES = ['Fair', 'Medium', 'Dark'];

const SellerDashboard = () => {


  const router=useRouter();
  const { products, loading, error, addProduct, fetchProducts } = useProduct();
  const [showForm, setShowForm] = useState(false);
  const [productData, setProductData] = useState(INITIAL_PRODUCT_DATA);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProducts = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
  // Example: Automatically show the form after 2 seconds
  const timer = setTimeout(() => {
    setShowForm(true); // or setShowForm(!showForm) to toggle
  }, 2000);

  return () => clearTimeout(timer); // cleanup
}, []);


  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name.includes('.')) {
    setProductData(prev => {
      const keys = name.split('.');
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
        
        if (arrayMatch) {
          const [, arrayName, index] = arrayMatch;
          current = current[arrayName][index];
        } else {
          if (!current[key]) current[key] = {};
          current = current[key];
        }
      }

      // Convert to number for specific fields
      const lastKey = keys[keys.length - 1];
      if (['original', 'discounted', 'stock'].includes(lastKey)) {
        current[lastKey] = value === '' ? 0 : Number(value);
      } else {
        current[lastKey] = value;
      }
      return updated;
    });
  } else {
    setProductData(prev => ({ ...prev, [name]: value }));
  }
};

  const handleMultiSelectChange = (e, path) => {
    const options = Array.from(e.target.selectedOptions);
    const values = options.map(option => option.value);
    
    setProductData(prev => {
      const keys = path.split('.');
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = values;
      return updated;
    });
  };

  const handleImageUpload = async (e, path) => {
    const file = e.target.files[0];
    if (!file || !path) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      setProductData(prev => {
        const keys = path.split('.');
        const updated = JSON.parse(JSON.stringify(prev));
        let current = updated;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = res.data.secure_url;
        return updated;
      });
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;
  
  // Validate variants
  const isValidVariants = productData.variants.every(variant => 
    variant.variant_id && 
    variant.color && 
    variant.size && 
    variant.stock !== undefined && variant.stock >= 0
  );

  if (!isValidVariants) {
    const invalidVariants = productData.variants
      .map((v, i) => !v.variant_id || !v.color || !v.size || v.stock === undefined || v.stock < 0 ? i : -1)
      .filter(i => i !== -1);
    console.log('Invalid variants at indexes:', invalidVariants);
    alert('Please fill all required fields for each variant (Variant ID, Color, Size, Stock). Check variants at indexes: ' + invalidVariants.join(', '));
    return;
  }
  setIsSubmitting(true);

  try {
    const cleanedProduct = {
      ...productData,
      price: {
        original: Number(productData.price.original) || 0,
        discounted: Number(productData.price.discounted) || 0,
        currency: productData.price.currency
      },
      variants: productData.variants.map(variant => ({
        ...variant,
        stock: parseInt(variant.stock) || 0
      }))
    };

    console.log('Submitting product:', JSON.stringify(cleanedProduct, null, 2));
    const result = await addProduct(cleanedProduct);

    if (result?.success) {
      alert('Product added successfully!');
      setProductData(INITIAL_PRODUCT_DATA);
      router.push('/pages/SellerDashboard');
      await fetchProducts();
    } else {
      alert(result?.error || 'Failed to add product');
    }
  } catch (err) {
    console.error('Submission error:', err);
    alert(typeof err === 'object' ? 
      err.message || 'An error occurred while submitting the product' : 
      err.toString());
  } finally {
    setIsSubmitting(false);
  }
};
 const { v4: uuidv4 } = require('uuid'); // Install uuid package: npm install uuid
// In SellerDashboard
const addVariant = () => {
  setProductData(prev => ({
    ...prev,
    variants: [
      ...prev.variants,
      { 
        variant_id: `${prev.product_id}-${uuidv4().slice(0, 8)}`, // Unique ID
        color: '', 
        size: '', 
        storage: '', 
        image: '', 
        stock: 0 
      }
    ]
  }));
};
  const removeVariant = (index) => {
    setProductData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const getSizeOptions = () => {
    return productData.type === 'clothing' ? CLOTHING_SIZES : ELECTRONIC_SIZES;
  };

  return (
    <div className="min-h-screen p-4 md:p-10 bg-gray-50">
    
      {error && (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
    <p className="font-semibold">Error {error.field ? `in ${error.field}` : ''}:</p>
    <p>{typeof error.message === 'object' ? JSON.stringify(error.message) : error.message}</p>
  </div>
)}

      {/* <div className="flex justify-center mb-6">
        <button
          className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Upload Product'}
        </button>
      </div> */}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 md:p-8 rounded-lg shadow-lg w-full max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product ID*</label>
              <input 
                name="product_id" 
                value={productData.product_id}
                onChange={handleChange} 
                className="w-full border p-2 rounded" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product Name*</label>
              <input 
                name="name" 
                value={productData.name}
                onChange={handleChange} 
                className="w-full border p-2 rounded" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <select 
                name="brand" 
                value={productData.brand}
                onChange={handleChange} 
                className="w-full border p-2 rounded"
              >
                <option value="">Select Brand</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select 
                name="category" 
                value={productData.category}
                onChange={handleChange} 
                className="w-full border p-2 rounded"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              name="description" 
              value={productData.description}
              onChange={handleChange} 
              className="w-full p-2 border rounded" 
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Original Price (INR)</label>
              <input 
                type="number"
                name="price.original" 
                value={productData.price.original}
                onChange={handleChange} 
                className="w-full border p-2 rounded" 
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discounted Price (INR)</label>
              <input 
                type="number"
                name="price.discounted" 
                value={productData.price.discounted}
                onChange={handleChange} 
                className="w-full border p-2 rounded" 
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <input 
                name="price.currency" 
                value="INR" 
                disabled 
                className="w-full bg-gray-100 border p-2 rounded" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Product Type</label>
            <select 
              name="type" 
              value={productData.type}
              onChange={handleChange} 
              className="w-full border p-2 rounded"
            >
              <option value="clothing">Clothing</option>
              <option value="electronics">Electronics</option>
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Variants</h3>
            {productData.variants.map((variant, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Variant ID*</label>
        <input 
          name={`variants[${index}].variant_id`}
          value={variant.variant_id}
          onChange={handleChange} 
          className="w-full border p-2 rounded" 
          required 
        />
      </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <select 
                      name={`variants[${index}].color`}
                      value={variant.color}
                      onChange={handleChange} 
                      className="w-full border p-2 rounded"
                    >
                      <option value="">Select Color</option>
                      {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Size</label>
                    <select 
                      name={`variants[${index}].size`}
                      value={variant.size}
                      onChange={handleChange} 
                      className="w-full border p-2 rounded"
                    >
                      <option value="">Select Size</option>
                      {getSizeOptions().map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stock</label>
                    <input 
                      type="number"
                      name={`variants[${index}].stock`}
                      value={variant.stock}
                      onChange={handleChange} 
                      className="w-full border p-2 rounded" 
                      min="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Variant Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, `variants[${index}].image`)} 
                    className="w-full border p-2 rounded" 
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  {variant.image && (
                    <div className="mt-2">
                      <img 
                        src={variant.image} 
                        alt="Variant preview" 
                        className="h-20 w-20 object-cover rounded border" 
                      />
                    </div>
                  )}
                </div>
                
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove Variant
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addVariant}
              className="text-blue-600 text-sm hover:text-blue-800"
            >
              + Add Another Variant
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Main Product Image*</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 'images.main')} 
              className="w-full border p-2 rounded" 
              required
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            {productData.images.main && (
              <div className="mt-2">
                <img 
                  src={productData.images.main} 
                  alt="Preview" 
                  className="h-20 w-20 object-cover rounded border" 
                />
              </div>
            )}
          </div>

          {productData.type === 'clothing' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Clothing Attributes</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Fabric</label>
                <input 
                  name="clothing_attributes.fabric" 
                  value={productData.clothing_attributes.fabric}
                  onChange={handleChange} 
                  className="w-full border p-2 rounded" 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Skin Type</label>
                  <select 
                    name="clothing_attributes.skin_compatibility.skin_types"
                    value={productData.clothing_attributes.skin_compatibility.skin_types || ''}
                    onChange={handleChange} 
                    className="w-full border p-2 rounded"
                  >
                    <option value="">Select Skin Type</option>
                    {SKIN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Skin Tone</label>
                  <select 
                    name="clothing_attributes.skin_compatibility.skin_tones"
                    value={productData.clothing_attributes.skin_compatibility.skin_tones || ''}
                    onChange={handleChange} 
                    className="w-full border p-2 rounded"
                  >
                    <option value="">Select Skin Tone</option>
                    {SKIN_TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {productData.type === 'electronics' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Electronics Attributes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Processor</label>
                  <input 
                    name="electronics_attributes.processor" 
                    value={productData.electronics_attributes.processor}
                    onChange={handleChange} 
                    className="w-full border p-2 rounded" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">RAM</label>
                  <input 
                    name="electronics_attributes.ram" 
                    value={productData.electronics_attributes.ram}
                    onChange={handleChange} 
                    className="w-full border p-2 rounded" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Storage</label>
                  <input 
                    name="electronics_attributes.storage" 
                    value={productData.electronics_attributes.storage}
                    onChange={handleChange} 
                    className="w-full border p-2 rounded" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Battery</label>
                  <input 
                    name="electronics_attributes.battery" 
                    value={productData.electronics_attributes.battery}
                    onChange={handleChange} 
                    className="w-full border p-2 rounded" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Display</label>
                  <input 
                    name="electronics_attributes.display" 
                    value={productData.electronics_attributes.display}
                    onChange={handleChange} 
                    className="w-full border p-2 rounded" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Warranty</label>
                  <input 
                    name="electronics_attributes.warranty" 
                    value={productData.electronics_attributes.warranty}
                    onChange={handleChange} 
                    className="w-full border p-2 rounded" 
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push('/pages/SellerDashboard')}
              className="bg-gray-300 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
            >
              {loading ? 'Submitting...' : 'Submit Product'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
};

export default SellerDashboard;