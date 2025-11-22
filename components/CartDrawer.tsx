import React, { useState } from 'react';
import { CartItem, PaymentMethod, StoreSettings } from '../types';
import { X, Trash2, ShoppingBag, CreditCard, Banknote } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: (name: string, tableNo: string, method: PaymentMethod) => void;
  settings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  settings
}) => {
  const [customerName, setCustomerName] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [showPayment, setShowPayment] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (!customerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!tableNo.trim()) {
      alert('Please enter your table number');
      return;
    }
    onCheckout(customerName, tableNo, paymentMethod);
    setShowPayment(false);
    setCustomerName('');
    setTableNo('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b flex justify-between items-center bg-brand-50">
          <h2 className="text-xl font-bold flex items-center gap-2 text-brand-900">
            <ShoppingBag className="text-brand-600" /> Your Order
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-brand-100 rounded-full text-brand-900">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
              <p>Your cart is empty.</p>
              <button onClick={onClose} className="mt-4 text-brand-600 font-semibold underline">Browse Menu</button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 border-b pb-4">
                <img 
                  src={item.image || `https://picsum.photos/seed/${item.id}/100/100`} 
                  alt={item.name} 
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-grow">
                  <h4 className="font-bold text-gray-800">{item.name}</h4>
                  <p className="text-brand-600 font-bold">RM {item.price.toFixed(2)}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 font-bold hover:text-brand-600"
                      >
                        -
                      </button>
                      <span className="font-semibold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 font-bold hover:text-brand-600"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-600 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            {!showPayment ? (
              <>
                <div className="flex justify-between items-center mb-4 text-lg">
                  <span className="text-gray-600">Total</span>
                  <span className="font-extrabold text-2xl text-brand-600">RM {total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30"
                >
                  Proceed to Checkout
                </button>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">Checkout Details</h3>
                    <button onClick={() => setShowPayment(false)} className="text-sm text-gray-500 underline">Back</button>
                 </div>
                
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter name"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Table No.</label>
                      <input 
                        type="text" 
                        value={tableNo}
                        onChange={(e) => setTableNo(e.target.value)}
                        placeholder="01"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-center"
                      />
                    </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                   <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          paymentMethod === PaymentMethod.CASH ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'
                        }`}
                      >
                        <Banknote size={24} />
                        <span className="font-bold text-sm">Cash (RM)</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod(PaymentMethod.QR)}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          paymentMethod === PaymentMethod.QR ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'
                        }`}
                      >
                        <CreditCard size={24} />
                        <span className="font-bold text-sm">QR DuitNow</span>
                      </button>
                   </div>
                </div>

                {paymentMethod === PaymentMethod.QR && (
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                    {settings.qrCodeImage ? (
                      <img src={settings.qrCodeImage} alt="DuitNow QR" className="max-w-[200px] h-auto mb-2" />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-xs text-gray-500">No QR Uploaded</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Scan to pay RM {total.toFixed(2)}</p>
                  </div>
                )}

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors mt-2 shadow-lg"
                >
                  Confirm Order
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};