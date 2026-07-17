import React, { useState } from 'react';
import { Card, BackButton, Button } from '../components/UI';
import { Colors, Typography, Layout } from '../theme/goqiiDesignSystem';

interface GroceryListProps {
  onBack: () => void;
}

const GroceryList: React.FC<GroceryListProps> = ({ onBack }) => {
  const [items, setItems] = useState([
    { id: '1', name: 'Brown Rice', quantity: '1 kg', category: 'Grains', checked: false },
    { id: '2', name: 'Chicken Breast', quantity: '500g', category: 'Proteins', checked: true },
    { id: '3', name: 'Broccoli', quantity: '2 heads', category: 'Vegetables', checked: false },
    { id: '4', name: 'Almond Milk', quantity: '1 L', category: 'Dairy/Alt', checked: false },
    { id: '5', name: 'Mixed Berries', quantity: '250g', category: 'Fruits', checked: false },
    { id: '6', name: 'Avocado', quantity: '2 large', category: 'Fruits', checked: true },
  ]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const categories = Array.from(new Set(items.map(i => i.category)));

  return (
    <div className="flex-1 flex flex-col bg-[#F5F6F8] dark:bg-slate-900 overflow-hidden transition-colors">
      <div className="p-6 pt-2 flex items-center gap-4 bg-white dark:bg-[#1E293B] border-b border-[#F1F5F9] dark:border-slate-700 z-10 transition-colors">
        <BackButton onClick={onBack} className="-ml-2 dark:text-slate-100" />
        <h1 className={`text-xl ${Typography.Black} text-slate-800 dark:text-white tracking-tight`}>Smart Grocery List</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 no-scrollbar">
        <div className={`mb-8 p-6 bg-green-500/5 dark:bg-[#39C101]/10 ${Layout.radius} border border-[#39C101]/20 shadow-none bg-white`}>
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 bg-[#39C101] text-white ${Layout.radius10} flex items-center justify-center shadow-none`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" /></svg>
             </div>
             <div className="space-y-0.5">
               <h4 className={`text-sm ${Typography.Black} text-slate-900 dark:text-white uppercase tracking-tight`}>Weekly Sync</h4>
               <p className={`text-[10px] text-[#A5B3C1] ${Typography.Bold} uppercase tracking-widest italic`}>Inventory forged from your Master Plan</p>
             </div>
          </div>
        </div>

        <div className="space-y-10">
          {categories.map(cat => (
            <div key={cat} className="space-y-4">
              <h3 className={`text-[11px] ${Typography.Black} text-[#A5B3C1] uppercase tracking-[0.2em] border-l-[3px] border-[#39C101] pl-3`}>{cat}</h3>
              <div className="space-y-3">
                {items.filter(i => i.category === cat).map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center justify-between p-5 ${Layout.radius} border transition-all cursor-pointer shadow-none ${item.checked ? 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-50' : 'bg-white dark:bg-slate-800 border-[#F1F5F9] dark:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 ${Layout.radius10} border-2 flex items-center justify-center transition-all shadow-none ${item.checked ? 'bg-[#39C101] border-[#39C101]' : 'border-slate-200 dark:border-slate-600'}`}>
                        {item.checked && <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>}
                      </div>
                      <span className={`text-sm ${Typography.Bold} tracking-tight ${item.checked ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{item.name}</span>
                    </div>
                    <span className={`text-[11px] ${Typography.Black} text-[#A5B3C1] uppercase tracking-widest`}>{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 flex gap-4">
        <Button variant="outline" className="flex-1 h-14 shadow-none">Share List</Button>
        <Button className="flex-1 h-14 shadow-none">Place Order</Button>
      </div>
    </div>
  );
};

export default GroceryList;