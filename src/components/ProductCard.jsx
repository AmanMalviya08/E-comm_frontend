import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await addToCart(product._id, 1, product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image wrapper */}
        <Link to={`/products/${product._id}`} className="block relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.isFeatured && (
            <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Featured
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center font-bold text-xs text-red-600">
              Out of Stock
            </span>
          )}
        </Link>

        {/* Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{product.category}</span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating || 4.5}</span>
            </div>
          </div>

          <Link to={`/products/${product._id}`} className="block">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Price & Action */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">Price</span>
          <p className="text-base font-bold text-gray-900">
            ${Number(product.price).toFixed(2)}
          </p>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={loading || product.stock === 0}
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
            added
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-700 hover:bg-emerald-600 hover:text-white'
          } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Add to Cart"
        >
          {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
