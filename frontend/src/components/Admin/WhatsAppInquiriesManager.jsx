import React, { useState } from 'react';
import { 
  MessageSquare, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Send,
  Smartphone,
  CreditCard,
  Search
} from 'lucide-react';
import { SHOP_INFO } from '../../data/mockData';

const MOCK_INQUIRIES = [
  {
    id: 'inq-101',
    customer_name: 'Amitabh Mishra',
    phone: '9839124501',
    device: 'Samsung Galaxy S24 Ultra 5G',
    color: 'Titanium Gray',
    source: 'Website Cart Drawer',
    emi_intent: 'Bajaj Finserv 0% EMI (12 Months)',
    timestamp: '15 mins ago',
    status: 'Pending Reply',
    message: 'Hello Amit Mobile Shop, I want to purchase Galaxy S24 Ultra (Titanium Gray) on 0% EMI. Is it in stock today?'
  },
  {
    id: 'inq-102',
    customer_name: 'Pooja Verma',
    phone: '9451203984',
    device: 'iPhone 16 Pro Max',
    color: 'Desert Titanium',
    source: 'Hero 3D Showcase',
    emi_intent: 'TVS Credit (Low Down Payment)',
    timestamp: '42 mins ago',
    status: 'Replied',
    message: 'नमस्ते Amit Mobile Shop, मुझे नया फोन iPhone 16 Pro Max खरीदना है। टीवीएस क्रेडिट पर क्या डाउन पेमेंट लगेगी?'
  },
  {
    id: 'inq-103',
    customer_name: 'Rajesh Kumar',
    phone: '9125678430',
    device: 'OnePlus 12R 5G',
    color: 'Cool Blue',
    source: 'Storefront Product Card',
    emi_intent: 'Samsung Finance+ Paperless',
    timestamp: '2 hours ago',
    status: 'Converted',
    message: 'Hello, what is the best cash discount if I take OnePlus 12R directly from Khorare shop counter?'
  },
  {
    id: 'inq-104',
    customer_name: 'Suman Tiwari',
    phone: '9889456123',
    device: 'Vivo V30 Pro 5G',
    color: 'Andaman Blue',
    source: 'Live EMI Calculator',
    emi_intent: 'Bajaj Finserv 0% EMI (6 Months)',
    timestamp: '3 hours ago',
    status: 'Pending Reply',
    message: 'नमस्ते, विवो V30 प्रो 6 महीने की किश्त पर चाहिए। आधार कार्ड से कितना समय लगेगा?'
  }
];

export default function WhatsAppInquiriesManager() {
  const [inquiries, setInquiries] = useState(MOCK_INQUIRIES);
  const [search, setSearch] = useState('');

  const filtered = inquiries.filter((inq) => 
    inq.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    inq.device.toLowerCase().includes(search.toLowerCase()) ||
    inq.phone.includes(search)
  );

  const handleOpenWhatsApp = (inquiry) => {
    const text = `Hello ${inquiry.customer_name}, thank you for contacting Amit Mobile Shop regarding *${inquiry.device}*. It is currently available in stock with 0% EMI. How may we assist you with your purchase?`;
    const url = `https://wa.me/91${inquiry.phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleMarkStatus = (id, newStatus) => {
    setInquiries((prev) => 
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
  };

  return (
    <div className="space-y-6 animate-panel-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Live Digital Leads
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Poppins']">
            WhatsApp Customer Inquiries
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time incoming product orders, EMI inquiries, and chat leads from the storefront
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inquiries or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Inquiries Stream Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((inq) => (
          <div 
            key={inq.id}
            className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800 shadow-xl flex flex-col justify-between hover:border-emerald-500/40 transition group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">
                    {inq.customer_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>+91 {inq.phone}</span>
                    <span>•</span>
                    <span className="text-[11px] text-slate-500">{inq.timestamp}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  inq.status === 'Converted'
                    ? 'bg-whatsapp-600/20 text-whatsapp-500 border-whatsapp-500/30'
                    : inq.status === 'Replied'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-gold-500/20 text-gold-400 border-gold-500/30 animate-pulse'
                }`}>
                  {inq.status}
                </span>
              </div>

              {/* Queried Device & Intent */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 mb-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Smartphone className="w-3.5 h-3.5 text-primary-400" />
                  <span>{inq.device}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({inq.color})</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gold-400 font-semibold">
                  <CreditCard className="w-3 h-3 text-gold-400" />
                  <span>{inq.emi_intent}</span>
                </div>
              </div>

              {/* Customer message snippet */}
              <p className="text-xs text-slate-300 italic line-clamp-2 bg-white/5 p-2.5 rounded-lg border border-white/5">
                "{inq.message}"
              </p>
            </div>

            {/* Action Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleMarkStatus(inq.id, 'Replied')}
                  className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Mark Replied
                </button>
                <button
                  onClick={() => handleMarkStatus(inq.id, 'Converted')}
                  className="text-[10px] font-semibold px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30"
                >
                  Mark Converted
                </button>
              </div>

              <button
                onClick={() => handleOpenWhatsApp(inq)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-whatsapp-600 hover:bg-whatsapp-500 text-white text-xs font-bold shadow-md shadow-whatsapp-600/30 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
