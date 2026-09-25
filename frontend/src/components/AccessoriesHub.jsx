import React, { useState } from 'react';
import { 
  Headphones, 
  Zap, 
  ShieldCheck, 
  Search, 
  ShoppingBag, 
  MessageCircle, 
  Check, 
  Sparkles,
  Smartphone,
  Cable
} from 'lucide-react';
import { INITIAL_ACCESSORIES, SHOP_INFO } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  { id: 'all', label_hi: 'सभी एक्सेसरीज़', label_en: 'All Accessories', icon: Sparkles },
  { id: 'covers', label_hi: 'कवर व केस', label_en: 'Back Covers', icon: Smartphone },
  { id: 'chargers', label_hi: 'फास्ट चार्जर', label_en: 'Fast Chargers', icon: Zap },
  { id: 'earphones', label_hi: 'इयरफोन व ब्लूटूथ', label_en: 'Earphones / TWS', icon: Headphones },
  { id: 'glass', label_hi: '11D टेम्पर्ड ग्लास', label_en: 'Tempered Glass', icon: ShieldCheck },
  { id: 'cables', label_hi: 'फास्ट केबल', label_en: 'Data Cables', icon: Cable },
];

export default function AccessoriesHub() {
  const { addToCart } = useCart();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedId, setAddedId] = useState(null);

  const filteredItems = INITIAL_ACCESSORIES.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.title.toLowerCase().includes(q) || 
      item.title_hi.toLowerCase().includes(q) || 
      item.brand.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      title: language === 'hi' ? item.title_hi : item.title,
      price: item.price,
      original_price: item.original_price,
      image_url: item.image_url,
      brand: item.brand,
      condition: 'new'
    });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const handleWhatsAppOrder = (item) => {
    const name = language === 'hi' ? item.title_hi : item.title;
    const msg = `नमस्ते Amit Mobile Shop, मुझे यह एक्सेसरी खरीदनी है:\n\n*${name}*\nकीमत: ₹${item.price.toLocaleString()}\nदुकान: खोड़ारे चौराहा\n\nक्या यह अभी काउंटर पर उपलब्ध है?`;
    const url = `https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="space-y-6">
      
      {/* Top Banner / Heading */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Headphones className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-hindi">
              ओरिजिनल मोबाइल एक्सेसरीज़ हब
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            फास्ट चार्जर, 11D टेम्पर्ड ग्लास, बैक कवर, boAt नेकबैंड और TWS ईयरबड्स — काउंटर पर चेक करके लें।
          </p>
        </div>

        {/* Quick Search */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="चार्जर, कवर, ग्लास सर्च करें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 -translate-y-0.5'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
              <span>{language === 'hi' ? cat.label_hi : cat.label_en}</span>
            </button>
          );
        })}
      </div>

      {/* Accessories Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold">कोई एक्सेसरी नहीं मिली</p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="mt-3 text-xs text-emerald-600 font-bold hover:underline"
          >
            सभी सामान देखें
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map(item => {
            const itemPrice = Number(item?.price) || 0;
            const itemOrigPrice = Number(item?.original_price) || 0;
            const discount = itemOrigPrice > itemPrice ? Math.round(((itemOrigPrice - itemPrice) / itemOrigPrice) * 100) : 0;
            const isJustAdded = addedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Image Box */}
                <div className="aspect-[4/3] bg-slate-50 border-b border-slate-100 p-4 relative flex items-center justify-center overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs">
                      {discount}% छूट
                    </div>
                  )}

                  {/* Stock Pill */}
                  <div className="absolute top-3 right-3 bg-white/95 border border-slate-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>स्टॉक उपलब्ध</span>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Category & Brand */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <span className="font-bold text-slate-800">{item.brand}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">{item.category_hi}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 font-hindi line-clamp-1 group-hover:text-emerald-700 transition-colors">
                      {item.title_hi}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono line-clamp-1 mt-0.5">
                      {item.title}
                    </p>

                    <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Warranty Tag */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium text-[11px]">{item.warranty_info}</span>
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">दुकान रेट</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-slate-950 font-['Poppins']">
                            ₹{itemPrice.toLocaleString()}
                          </span>
                          {itemOrigPrice > 0 && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{itemOrigPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          isJustAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>जुड़ गया</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>कार्ट में लें</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleWhatsAppOrder(item)}
                        className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                        title="WhatsApp पर तुरंत ऑर्डर करें"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>ऑर्डर करें</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Counter Testing Guarantee */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base font-hindi">
              काउंटर टेस्टिंग एवं तुरंत फिटिंग सुविधा
            </h4>
            <p className="text-xs text-emerald-800">
              खोड़ारे चौराहे की दुकान पर आकर चार्जर, इयरफोन व टेम्पर्ड ग्लास चेक करवाएं और संतुष्ट होने पर ही भुगतान करें।
            </p>
          </div>
        </div>
        <a
          href={`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent('नमस्ते Amit Mobile Shop, मुझे किसी एक्सेसरी की उपलब्धता के बारे में पूछना है।')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <MessageCircle className="w-4 h-4" />
          <span>व्हाट्सएप पर पूछें</span>
        </a>
      </div>

    </section>
  );
}
