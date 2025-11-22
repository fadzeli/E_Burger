import React, { useState, useRef } from 'react';
import { Product, Order, OrderStatus, StoreSettings } from '../types';
import { generateBurgerDescription } from '../services/geminiService';
import { Plus, Trash2, Edit2, CheckCircle, XCircle, Image as ImageIcon, Loader2, Sparkles, Settings, Package, ShoppingCart, LogOut } from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  onUpdateSettings: (s: StoreSettings) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  settings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdateSettings,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('orders');
  
  // Form State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    description: '',
    category: 'Beef',
    image: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Handlers
  const handleGenerateDescription = async () => {
    if (!formData.name) return;
    setIsGenerating(true);
    const desc = await generateBurgerDescription(formData.name || '', formData.category || 'Burger');
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      id: editMode && isEditing ? isEditing : Date.now().toString(),
      name: formData.name!,
      price: Number(formData.price),
      description: formData.description || '',
      category: formData.category || 'General',
      image: formData.image || ''
    };

    if (editMode) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', price: 0, description: '', category: 'Beef', image: '' });
    setIsEditing(null);
    setEditMode(false);
  };

  const startEdit = (product: Product) => {
    setFormData(product);
    setIsEditing(product.id);
    setEditMode(true);
    setActiveTab('products');
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateSettings({ ...settings, qrCodeImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
  const completedOrders = orders.filter(o => o.status !== OrderStatus.PENDING);

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white p-6 sticky top-0 z-10 shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">e-Burger Admin</h1>
            <div className="text-xs bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
               {pendingOrders.length} Pending
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-full font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'orders' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200'}`}
          >
            <ShoppingCart size={18} /> Orders
            {pendingOrders.length > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingOrders.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-full font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'products' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200'}`}
          >
            <Package size={18} /> Products
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 rounded-full font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'settings' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200'}`}
          >
            <Settings size={18} /> Settings
          </button>
        </div>

        {/* Tab Content: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-orange-500 pl-3">Pending Orders</h2>
              {pendingOrders.length === 0 ? (
                <p className="text-gray-500 italic bg-white p-6 rounded-lg text-center shadow-sm">No pending orders.</p>
              ) : (
                <div className="grid gap-4">
                  {pendingOrders.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-xl shadow border-l-4 border-brand-500">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">
                            {order.customerName} 
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Table {order.tableNo}
                            </span>
                          </h3>
                          <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="block font-extrabold text-brand-600 text-lg">RM {order.totalAmount.toFixed(2)}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${order.paymentMethod === 'QR' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="text-gray-500">RM {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onUpdateOrderStatus(order.id, OrderStatus.COMPLETED)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 active:scale-95 transition-all"
                        >
                          <CheckCircle size={18} /> Complete
                        </button>
                        <button 
                          onClick={() => onUpdateOrderStatus(order.id, OrderStatus.CANCELLED)}
                          className="px-4 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 active:scale-95 transition-all"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-green-500 pl-3">Completed History</h2>
              <div className="grid gap-3 opacity-75">
                {completedOrders.map(order => (
                   <div key={order.id} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">
                          {order.customerName} 
                          {order.tableNo && <span className="text-xs text-gray-500 ml-1">(T-{order.tableNo})</span>}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="font-bold text-gray-600">RM {order.totalAmount.toFixed(2)}</span>
                   </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Products */}
        {activeTab === 'products' && (
          <div className="grid md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
            {/* Form Section */}
            <div className="md:col-span-1">
              <div className="bg-white p-5 rounded-xl shadow-md sticky top-24">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  {editMode ? <Edit2 size={20} className="text-blue-600"/> : <Plus size={20} className="text-brand-600"/>}
                  {editMode ? 'Edit Product' : 'Add New Burger'}
                </h3>
                
                <form onSubmit={handleSubmitProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Burger Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="e.g. The Big Chief"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2 border rounded-lg outline-none"
                    >
                      <option value="Beef">Beef</option>
                      <option value="Chicken">Chicken</option>
                      <option value="Fish">Fish</option>
                      <option value="Veggie">Veggie</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (RM)</label>
                    <input 
                      type="number" 
                      required
                      step="0.10"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                       <label className="block text-sm font-medium text-gray-700">Description</label>
                       <button 
                        type="button"
                        disabled={isGenerating || !formData.name}
                        onClick={handleGenerateDescription}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-200 disabled:opacity-50 transition-colors"
                       >
                         {isGenerating ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10}/>}
                         AI Generate
                       </button>
                    </div>
                    <textarea 
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                      placeholder="Describe ingredients..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input 
                      type="text" 
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    {editMode && (
                      <button 
                        type="button" 
                        onClick={resetForm}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit"
                      className={`flex-1 text-white py-2 rounded-lg font-semibold shadow-md transition-colors ${editMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brand-600 hover:bg-brand-700'}`}
                    >
                      {editMode ? 'Update' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* List Section */}
            <div className="md:col-span-2 grid gap-4 content-start">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center group hover:shadow-md transition-shadow">
                  <img src={p.image || `https://picsum.photos/seed/${p.id}/100/100`} alt={p.name} className="w-16 h-16 rounded-lg object-cover bg-gray-200"/>
                  <div className="flex-grow">
                    <h4 className="font-bold text-gray-800">{p.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-sm font-bold text-brand-600">RM {p.price.toFixed(2)}</span>
                       <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">{p.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"><Edit2 size={18}/></button>
                    <button onClick={() => onDeleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Settings */}
        {activeTab === 'settings' && (
           <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md animate-in slide-in-from-bottom-2 duration-300">
              <h3 className="font-bold text-xl mb-6 text-gray-800 border-b pb-2">Store Settings</h3>
              
              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">Payment QR Code (DuitNow)</label>
                <p className="text-sm text-gray-500 mb-3">Upload the QR code image that customers will scan for payment.</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-gray-50">
                   {settings.qrCodeImage ? (
                     <div className="relative group">
                       <img src={settings.qrCodeImage} alt="QR Preview" className="max-w-full h-48 object-contain mb-4 shadow-sm"/>
                       <button 
                         onClick={() => onUpdateSettings({...settings, qrCodeImage: null})}
                         className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                   ) : (
                     <div className="text-gray-400 mb-4">
                       <ImageIcon size={48} className="mx-auto mb-2"/>
                       <span>No QR Code Uploaded</span>
                     </div>
                   )}
                   
                   <label className="cursor-pointer bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors">
                     <span>Upload Image</span>
                     <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                   </label>
                </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};