import React from 'react';
import { Product } from '../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="h-40 overflow-hidden relative bg-gray-100">
        <img 
          src={product.image || `https://picsum.photos/seed/${product.id}/400/300`} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 leading-tight">{product.name}</h3>
          <span className="text-brand-600 font-extrabold text-lg whitespace-nowrap">RM {product.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-500 text-sm mb-4 flex-grow line-clamp-2">{product.description}</p>
        <button 
          onClick={() => onAddToCart(product)}
          className="w-full bg-brand-600 hover:bg-brand-900 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
        >
          <Plus size={18} />
          Add to Order
        </button>
      </div>
    </div>
  );
};