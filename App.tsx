import React, { useState, useEffect } from 'react';
import { Product, Order, CartItem, PaymentMethod, OrderStatus, StoreSettings } from './types';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { ShoppingBag, Menu, LayoutDashboard, UtensilsCrossed } from 'lucide-react';

// Dummy Initial Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Classic Cheeseburger', price: 12.50, category: 'Beef', description: 'Juicy beef patty, cheddar cheese, lettuce, tomato, and house sauce.', image: 'https://picsum.photos/id/292/400/300' },
  { id: '2', name: 'Spicy Chicken Deluxe', price: 14.00, category: 'Chicken', description: 'Crispy fried chicken, spicy mayo, slaw, and pickles.', image: 'https://picsum.photos/id/835/400/300' },
  { id: '3', name: 'Double Trouble', price: 18.90, category: 'Beef', description: 'Two beef patties, double cheese, caramelized onions, and BBQ sauce.', image: 'https://picsum.photos/id/488/400/300' },
];

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<'customer' | 'login' | 'admin'>('customer');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('eburger_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('eburger_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('eburger_settings');
    return saved ? JSON.parse(saved) : { qrCodeImage: null };
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('eburger_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('eburger_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('eburger_settings', JSON.stringify(settings));
  }, [settings]);

  // --- Actions ---

  // Admin Auth
  const handleLogin = () => {
    setIsAuthenticated(true);
    setView('admin');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('customer');
  };

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setView('admin');
    } else {
      setView('login');
    }
  };

  // Product Management
  const handleAddProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const handleUpdateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Cart Actions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeCartItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = (customerName: string, tableNo: string, paymentMethod: PaymentMethod) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      customerName,
      tableNo,
      items: [...cart],
      totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      paymentMethod,
      status: OrderStatus.PENDING,
      createdAt: Date.now()
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setIsCartOpen(false);
    alert('Order placed successfully!');
  };

  // Order Management
  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  // Derived State
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = categoryFilter === 'All' ? products : products.filter(p => p.category === categoryFilter);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // --- Render ---

  if (view === 'login') {
    return (
      <AdminLogin 
        onLogin={handleLogin}
        onBack={() => setView('customer')}
      />
    );
  }

  if (view === 'admin') {
    return (
      <AdminDashboard 
        products={products}
        orders={orders}
        settings={settings}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateOrderStatus={updateOrderStatus}
        onUpdateSettings={setSettings}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-50/50 font-sans pb-20">
      {/* Mobile Header */}
      <header className="bg-white sticky top-0 z-40 shadow-sm px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 text-white p-2 rounded-lg">
            <UtensilsCrossed size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">e-Burger</h1>
        </div>
        
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ShoppingBag size={28} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full animate-bounce">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* Hero Section */}
      <div className="px-4 py-6 bg-gradient-to-br from-brand-500 to-brand-600 text-white mb-6 rounded-b-3xl shadow-lg mx-2">
        <h2 className="text-3xl font-bold mb-2">Hungry?</h2>
        <p className="opacity-90 mb-4">Order the best burgers in town, delivered to your table.</p>
      </div>

      {/* Category Filter */}
      <div className="px-4 mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={addToCart} 
          />
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400">
            <p>No products found in this category.</p>
          </div>
        )}
      </div>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeCartItem}
        onCheckout={handleCheckout}
        settings={settings}
      />

      {/* Admin Toggle Float Button */}
      <button 
        onClick={handleAdminClick}
        className="fixed bottom-6 right-6 bg-gray-800 text-white p-4 rounded-full shadow-xl hover:bg-gray-900 transition-all z-30 flex items-center gap-2"
      >
        <LayoutDashboard size={20} /> <span className="text-sm font-bold hidden md:inline">Admin Area</span>
      </button>
    </div>
  );
};

export default App;