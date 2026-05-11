import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Medicine, Supplier, PurchaseOrder, DispenseRecord, PharmacySettings
} from '../data/sampleData';
import {
  SAMPLE_MEDICINES, SAMPLE_SUPPLIERS, SAMPLE_ORDERS, SAMPLE_DISPENSES, DEFAULT_SETTINGS
} from '../data/sampleData';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface DataContextType {
  medicines: Medicine[];
  suppliers: Supplier[];
  orders: PurchaseOrder[];
  dispenses: DispenseRecord[];
  settings: PharmacySettings;
  toasts: ToastItem[];
  addMedicine: (m: Omit<Medicine, 'id'>) => void;
  updateMedicine: (m: Medicine) => void;
  deleteMedicine: (id: string) => void;
  addSupplier: (s: Omit<Supplier, 'id'>) => void;
  updateSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;
  addOrder: (o: Omit<PurchaseOrder, 'id'>) => void;
  updateOrder: (o: PurchaseOrder) => void;
  markOrderDelivered: (id: string) => void;
  addDispense: (d: Omit<DispenseRecord, 'id'>) => void;
  updateSettings: (s: PharmacySettings) => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  showToast: (message: string, type?: ToastItem['type']) => void;
  dismissToast: (id: string) => void;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

let toastCounter = 0;

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>(() => load('pharmacy_medicines', SAMPLE_MEDICINES));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => load('pharmacy_suppliers', SAMPLE_SUPPLIERS));
  const [orders, setOrders] = useState<PurchaseOrder[]>(() => load('pharmacy_orders', SAMPLE_ORDERS));
  const [dispenses, setDispenses] = useState<DispenseRecord[]>(() => load('pharmacy_dispenses', SAMPLE_DISPENSES));
  const [settings, setSettings] = useState<PharmacySettings>(() => load('pharmacy_settings', DEFAULT_SETTINGS));
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => { save('pharmacy_medicines', medicines); }, [medicines]);
  useEffect(() => { save('pharmacy_suppliers', suppliers); }, [suppliers]);
  useEffect(() => { save('pharmacy_orders', orders); }, [orders]);
  useEffect(() => { save('pharmacy_dispenses', dispenses); }, [dispenses]);
  useEffect(() => { save('pharmacy_settings', settings); }, [settings]);

  const showToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = String(++toastCounter);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3300);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addMedicine = (m: Omit<Medicine, 'id'>) => {
    const newM = { ...m, id: 'm' + Date.now() };
    setMedicines(prev => [...prev, newM]);
    showToast('Medicine added successfully');
  };

  const updateMedicine = (m: Medicine) => {
    setMedicines(prev => prev.map(x => x.id === m.id ? m : x));
    showToast('Medicine updated successfully');
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(x => x.id !== id));
    showToast('Medicine deleted');
  };

  const addSupplier = (s: Omit<Supplier, 'id'>) => {
    setSuppliers(prev => [...prev, { ...s, id: 's' + Date.now() }]);
    showToast('Supplier added successfully');
  };

  const updateSupplier = (s: Supplier) => {
    setSuppliers(prev => prev.map(x => x.id === s.id ? s : x));
    showToast('Supplier updated successfully');
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(x => x.id !== id));
    showToast('Supplier deleted');
  };

  const addOrder = (o: Omit<PurchaseOrder, 'id'>) => {
    const id = 'PO-' + String(orders.length + 1).padStart(3, '0');
    setOrders(prev => [...prev, { ...o, id }]);
    showToast('Purchase order created');
  };

  const updateOrder = (o: PurchaseOrder) => {
    setOrders(prev => prev.map(x => x.id === o.id ? o : x));
    showToast('Order updated');
  };

  const markOrderDelivered = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Delivered', actualDelivery: today } : o));
    showToast('Order marked as delivered');
  };

  const addDispense = (d: Omit<DispenseRecord, 'id'>) => {
    const newD = { ...d, id: 'd' + Date.now() };
    setDispenses(prev => [...prev, newD]);
    setMedicines(prev => prev.map(m => {
      if (m.id !== d.medicineId) return m;
      const newQty = m.stockQty - d.qty;
      const status = newQty <= 0 ? 'Out of Stock' : newQty <= m.lowStockThreshold ? 'Low Stock' : 'In Stock';
      return { ...m, stockQty: newQty, status };
    }));
    showToast('Medicine dispensed successfully');
  };

  const updateSettings = (s: PharmacySettings) => {
    setSettings(s);
    showToast('Settings saved');
  };

  const resetToSampleData = () => {
    setMedicines(SAMPLE_MEDICINES);
    setSuppliers(SAMPLE_SUPPLIERS);
    setOrders(SAMPLE_ORDERS);
    setDispenses(SAMPLE_DISPENSES);
    setSettings(DEFAULT_SETTINGS);
    showToast('Sample data restored');
  };

  const clearAllData = () => {
    setMedicines([]);
    setSuppliers([]);
    setOrders([]);
    setDispenses([]);
    setSettings(DEFAULT_SETTINGS);
    showToast('All data cleared', 'info');
  };

  return (
    <DataContext.Provider value={{
      medicines, suppliers, orders, dispenses, settings, toasts,
      addMedicine, updateMedicine, deleteMedicine,
      addSupplier, updateSupplier, deleteSupplier,
      addOrder, updateOrder, markOrderDelivered,
      addDispense, updateSettings,
      resetToSampleData, clearAllData,
      showToast, dismissToast,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
