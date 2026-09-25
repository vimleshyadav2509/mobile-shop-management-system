import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  hi: {
    // Top Bar & Navbar
    shop_title: "Amit Mobile Shop",
    shop_subtitle: "Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312 • नया फोन, सेकंड हैंड फोन व 1 घंटे में रिपेयरिंग",
    location_badge: "Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312",
    timing: "रोजाना सुबह 9:00 से रात 8:30 बजे तक",
    lang_toggle_btn: "English",
    whatsapp_chat: "व्हाट्सएप पर बात करें",
    call_now: "कॉल करें",

    // Main 2-Hub Buttons
    hub_buying: "1. मोबाइल खरीदें (Buying Hub)",
    hub_repairing: "2. मोबाइल रिपेयरिंग (Repairing Hub)",

    // Hero Section
    hero_badge: "Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312 - सबसे भरोसेमंद मोबाइल स्टोर",
    hero_title: "नया मोबाइल खरीदें या फोन 1 घंटे में ठीक करवाएं",
    hero_subtitle: "बजाज फिनसर्व, TVS क्रेडिट और सैमसंग फाइनेंस+ पर बिना किसी झंझट के आसान किश्तों (0% EMI) पर फोन ले जाएं। रिपेयरिंग का लाइव स्टेटस रसीद नंबर से देखें।",
    hero_cta_buy: "नया व सेकंड हैंड फोन देखें",
    hero_cta_repair: "रिपेयरिंग खर्चा और स्टेटस देखें",

    // Value Prop Chips
    trust_emi: "0% आसान किश्तें (EMI)",
    trust_emi_desc: "बजाज, TVS, सैमसंग फाइनेंस",
    trust_repair: "1 घंटे में रिपेयर",
    trust_repair_desc: "स्क्रीन व बैटरी तुरंत बदलें",
    trust_warranty: "पक्की दुकान वारंटी",
    trust_warranty_desc: "32-पॉइंट चेकिंग + पक्का बिल",
    trust_support: "सीधा फोन सपोर्ट",
    trust_support_desc: "Amit Mobile Shop सपोर्ट",

    // Buying Hub
    buying_title: "Amit Mobile Shop - Buying Hub",
    buying_desc: "नए ओरिजिनल 5G स्मार्टफोन या दुकान की वारंटी वाले प्रमाणित सेकंड-हैंड फोन चुनें।",
    tab_new: "टैब A: नया फोन खरीदें (New)",
    tab_refurb: "टैब B: सेकंड-हैंड फोन खरीदें (Second-Hand)",
    search_new_placeholder: "नया फोन खोजें (उदा. Galaxy S24, Vivo V30)...",
    search_refurb_placeholder: "पुराना फोन खोजें (उदा. iPhone 13, OnePlus)...",
    all_brands: "सभी ब्रांड",
    phones_available: "फोन उपलब्ध हैं",
    no_phones_found: "कोई फोन नहीं मिला",
    reset_filters: "फ़िल्टर रीसेट करें",
    badge_brand_new: "★ सीलबंद नया",
    badge_like_new: "✓ एकदम नए जैसा (Like New)",
    badge_good: "✓ बढ़िया कंडीशन (Good)",
    emi_calc_btn: "EMI किश्त जानें",
    buy_whatsapp_btn: "व्हाट्सएप पर बुक करें",
    offer_price: "ऑफर कीमत:",

    // EMI Spotlight
    emi_banner_title: "0% ब्याज और आसान किश्तों की सुविधा - Amit Mobile Shop",
    emi_banner_desc: "पूरा पैसा एक बार में देने की जरूरत नहीं। केवल आधार कार्ड, पैन कार्ड या बैंक पासबुक लाकर 15 मिनट में फोन ले जाएं।",
    open_emi_calc: "किश्त कैलकुलेटर खोलें",
    bajaj_title: "बजाज फिनसर्व (Bajaj)",
    bajaj_badge: "0% ब्याज",
    bajaj_desc: "पुराने कार्ड धारकों और नए ग्राहकों के लिए तुरंत अप्रूवल।",
    tvs_title: "TVS क्रेडिट (TVS)",
    tvs_badge: "आसान अप्रूवल",
    tvs_desc: "Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312 व आसपास के ग्रामीण भाइयों के लिए कम से कम डाउन पेमेंट।",
    samsung_title: "सैमसंग फाइनेंस+ (Samsung)",
    samsung_badge: "100% पेपरलेस",
    samsung_desc: "सैमसंग फोन के लिए आधार OTP से 5 मिनट में डिजिटल लोन।",

    // EMI Calculator Modal
    modal_calc_title: "EMI किश्त कैलकुलेटर - Amit Mobile Shop",
    modal_device_price: "फोन की कीमत",
    modal_est_monthly: "अनुमानित मासिक किश्त",
    modal_down_payment: "डाउन पेमेंट (शुरुआती जमा)",
    modal_zero_down: "₹0 (शून्य डाउन पेमेंट)",
    modal_tenure: "किश्त की अवधि (महीने)",
    modal_months: "महीने",
    modal_choose_partner: "फाइनेंस कंपनी चुनें",
    modal_doc_tip: "दुकान (Amit Mobile Shop, Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312) पर केवल आधार कार्ड, पैन कार्ड और बैंक पासबुक साथ लाएं। तुरंत अप्रूवल मिलेगा।",
    modal_apply_whatsapp: "इस EMI प्लान के लिए व्हाट्सएप करें",

    // Repairing Hub
    repair_title: "Amit Mobile Shop - Repairing Hub",
    repair_desc: "दुकान आने से पहले घर बैठे खर्चे और समय का तुरंत पता लगाएं या अपनी रसीद से रिपेयरिंग स्टेटस ट्रैक करें।",
    subtab_estimator: "खर्चे और समय का अनुमान (Price Estimator)",
    subtab_tracker: "रसीद नंबर से स्थिति देखें (Job Sheet Tracker)",
    express_guarantee_1: "1 घंटे में कॉम्बो / स्क्रीन रिप्लेसमेंट",
    express_guarantee_2: "माइक्रोस्कोप से मदरबोर्ड व IC रिपेयरिंग",
    express_guarantee_3: "3 से 6 महीने की दुकान वारंटी",

    // Estimator Form
    step_1_brand: "1. मोबाइल का ब्रांड चुनें",
    step_2_model: "2. मोबाइल का मॉडल लिखें",
    step_3_issue: "3. फोन में क्या खराबी है चुनें",
    step_4_notes: "4. कोई और जानकारी (वैकल्पिक)",
    calc_estimate_btn: "खर्चा और समय का अनुमान लगाएं",
    calculating: "अनुमान लगाया जा रहा है...",
    est_cost_label: "अनुमानित खर्चा",
    est_time_label: "रिपेयरिंग में लगा समय",
    est_quality_label: "पार्ट्स की क्वालिटी",
    est_warranty_label: "दुकान की वारंटी",
    tested_grade: "ओरिजिनल टेस्टेड ग्रेड",
    tech_tip_label: "Amit Mobile Shop सलाह:",
    show_breakdown: "खर्चे का ब्यौरा देखें (सामान + मजदूरी)",
    hide_breakdown: "ब्यौरा छिपाएं",
    part_cost_label: "सामान (स्पेयर पार्ट) का खर्चा:",
    labor_cost_label: "कारीगरी व सर्विस फीस:",
    book_repair_wa: "यह रिपेयर व्हाट्सएप पर बुक करें और दुकान आएं",

    // Job Sheet Tracker
    tracker_heading: "फोन रिपेयरिंग का लाइव स्टेटस देखें - Amit Mobile Shop",
    tracker_subheading: "अपनी जमा रसीद पर लिखा जॉब शीट नंबर दर्ज करें (उदा. AMS-101)",
    tracker_input_placeholder: "जॉब शीट नंबर लिखें (उदा. AMS-101)...",
    tracker_btn: "स्टेटस चेक करें",
    quick_test_chips: "डेमो रसीद नंबर:",
    stage_received: "दुकान पर जमा",
    stage_received_desc: "फोन काउंटर पर प्राप्त हुआ",
    stage_in_repair: "रिपेयरिंग जारी",
    stage_in_repair_desc: "कारीगर फोन ठीक कर रहे हैं",
    stage_ready: "ले जाने के लिए तैयार",
    stage_ready_desc: "टेस्टिंग पूरी, दुकान काउंटर पर तैयार",
    stage_delivered: "ग्राहक को सौंप दिया",
    stage_delivered_desc: "वारंटी बिल के साथ दिया गया",
    cust_name_label: "ग्राहक का नाम:",
    issue_label: "शिकायत / खराबी:",
    est_bill_label: "अनुमानित बिल:",
    handled_by_label: "कारीगर:",
    tech_note_label: "कारीगर का नोट:",
    track_wa_inquiry: "इस रसीद के बारे में व्हाट्सएप पर बात करें",

    // Contact Bar & Footer
    quick_call: "सीधा फोन लगाएं",
    footer_tagline: "Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312 - सबसे भरोसेमंद मोबाइल शोरूम व एक्सप्रेस सर्विस सेंटर।",
    footer_address_title: "दुकान का पूरा पता व समय",
    footer_address: "Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312",
    footer_directions: "गूगल मैप्स पर दुकान का सही रास्ता देखें",
    footer_contacts_title: "दुकान के फोन नंबर",
    footer_rights: "सर्वाधिकार सुरक्षित। Amit Mobile Shop.",
  },
  en: {
    // Top Bar & Navbar
    shop_title: "Amit Mobile Shop",
    shop_subtitle: "Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312 • New Phones & 1-Hour Repairs",
    location_badge: "Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312",
    timing: "Daily: 9:00 AM - 8:30 PM",
    lang_toggle_btn: "हिंदी",
    whatsapp_chat: "WhatsApp Chat",
    call_now: "Call Store",

    // Main 2-Hub Buttons
    hub_buying: "1. Buying Hub (Phones)",
    hub_repairing: "2. Repairing Hub (Service)",

    // Hero Section
    hero_badge: "Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312 - Most Trusted Store",
    hero_title: "Buy Latest Smartphones or Get 1-Hour Express Repairs",
    hero_subtitle: "Walk away with your dream phone on Bajaj Finserv, TVS Credit & Samsung Finance+ 0% EMI. Or track your device repair live with your receipt ID.",
    hero_cta_buy: "Explore Phones & EMI Plans",
    hero_cta_repair: "Check Repair Cost & Track Job",

    // Value Prop Chips
    trust_emi: "0% Easy EMI Finance",
    trust_emi_desc: "Bajaj, TVS & Samsung",
    trust_repair: "1-Hour Express Service",
    trust_repair_desc: "Display & battery while you wait",
    trust_warranty: "Verified Shop Warranty",
    trust_warranty_desc: "32-Point check + cash bill",
    trust_support: "Direct Phone Support",
    trust_support_desc: "Amit Mobile Shop Support",

    // Buying Hub
    buying_title: "Amit Mobile Shop - Buying Hub",
    buying_desc: "Browse brand new 5G phones with official warranty or tested pre-owned refurbished smartphones.",
    tab_new: "Tab A: Buy New Phone",
    tab_refurb: "Tab B: Buy Second-Hand Phone",
    search_new_placeholder: "Search new phones (e.g. Galaxy S24, Vivo V30)...",
    search_refurb_placeholder: "Search refurbished phones (e.g. iPhone 13, OnePlus)...",
    all_brands: "All Brands",
    phones_available: "Phones Available",
    no_phones_found: "No Phones Found",
    reset_filters: "Reset Filters",
    badge_brand_new: "★ Brand New",
    badge_like_new: "✓ Like New Refurbished",
    badge_good: "✓ Good Condition Pre-Owned",
    emi_calc_btn: "Check EMI",
    buy_whatsapp_btn: "Book on WhatsApp",
    offer_price: "Offer Price:",

    // EMI Spotlight
    emi_banner_title: "0% Interest & Easy EMI Available at Amit Mobile Shop",
    emi_banner_desc: "No need for full upfront cash. Bring Aadhaar Card, PAN Card or Bank Passbook to get instant 15-minute financing approval.",
    open_emi_calc: "Open EMI Calculator",
    bajaj_title: "Bajaj Finserv",
    bajaj_badge: "0% Interest",
    bajaj_desc: "Instant digital approval for existing EMI Card holders & new buyers.",
    tvs_title: "TVS Credit",
    tvs_badge: "Easy Approval",
    tvs_desc: "Lowest down payment schemes crafted for Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312 & rural customers.",
    samsung_title: "Samsung Finance+",
    samsung_badge: "100% Paperless",
    samsung_desc: "5-minute paperless loan via Aadhaar OTP on Samsung Galaxy phones.",

    // EMI Calculator Modal
    modal_calc_title: "EMI Financing Calculator - Amit Mobile Shop",
    modal_device_price: "Device Price",
    modal_est_monthly: "Est. Monthly EMI",
    modal_down_payment: "Down Payment",
    modal_zero_down: "₹0 (Zero Down Payment)",
    modal_tenure: "Loan Tenure (Months)",
    modal_months: "Months",
    modal_choose_partner: "Select Financing Partner",
    modal_doc_tip: "Bring your Aadhaar Card, PAN Card, and Bank Passbook to Amit Mobile Shop (Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312) for instant approval.",
    modal_apply_whatsapp: "Apply for this EMI via WhatsApp",

    // Repairing Hub
    repair_title: "Amit Mobile Shop - Repairing Hub",
    repair_desc: "Transparent repair prices and turnaround time estimations before visiting, plus receipt tracking.",
    subtab_estimator: "Repair Price Estimator",
    subtab_tracker: "Live Job Sheet Tracker",
    express_guarantee_1: "1-Hour Express Combo / Display Replacement",
    express_guarantee_2: "Microscope Chip-Level Motherboard & IC Repair",
    express_guarantee_3: "3 to 6 Months Warranty + Bill",

    // Estimator Form
    step_1_brand: "1. Select Device Brand",
    step_2_model: "2. Enter Exact Model Name",
    step_3_issue: "3. Choose the Problem",
    step_4_notes: "4. Additional Details (Optional)",
    calc_estimate_btn: "Calculate Repair Cost & Turnaround Time",
    calculating: "Calculating estimate...",
    est_cost_label: "Estimated Cost",
    est_time_label: "Est. Repair Time",
    est_quality_label: "Part Quality",
    est_warranty_label: "Shop Warranty",
    tested_grade: "Original Tested Grade",
    tech_tip_label: "Amit Mobile Shop Tip:",
    show_breakdown: "Show Cost Breakdown (Parts vs Labor)",
    hide_breakdown: "Hide Cost Breakdown",
    part_cost_label: "Estimated Spare Part Cost:",
    labor_cost_label: "Technician Bench & Service Fee:",
    book_repair_wa: "Book this repair on WhatsApp & visit store",

    // Job Sheet Tracker
    tracker_heading: "Track Your Phone Repair Status - Amit Mobile Shop",
    tracker_subheading: "Enter the Job Sheet ID on your deposit receipt (e.g. AMS-101)",
    tracker_input_placeholder: "Enter Job Sheet ID (e.g. AMS-101)...",
    tracker_btn: "Track Status",
    quick_test_chips: "Quick Demo Job Sheets:",
    stage_received: "Received at Store",
    stage_received_desc: "Device checked in at shop desk",
    stage_in_repair: "In Repair",
    stage_in_repair_desc: "Technician bench repair underway",
    stage_ready: "Ready for Pickup",
    stage_ready_desc: "Quality verified, ready for pickup",
    stage_delivered: "Delivered",
    stage_delivered_desc: "Collected with warranty receipt",
    cust_name_label: "Customer Name:",
    issue_label: "Reported Problem:",
    est_bill_label: "Estimated Bill:",
    handled_by_label: "Handled By:",
    tech_note_label: "Technician Note:",
    track_wa_inquiry: "Chat on WhatsApp regarding this Job Sheet",

    // Contact Bar & Footer
    quick_call: "Call Store Now",
    footer_tagline: "Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312 - premier mobile showroom and express repair center.",
    footer_address_title: "Store Location & Hours",
    footer_address: "Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312",
    footer_directions: "Get Directions on Google Maps",
    footer_contacts_title: "Store Contacts",
    footer_rights: "All rights reserved. Amit Mobile Shop.",
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('ams_language') || 'hi';
    } catch {
      return 'hi';
    }
  });
  const [hasChosenLanguage, setHasChosenLanguage] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ams_language');
      if (saved === 'hi' || saved === 'en') {
        setLanguageState(saved);
      }
      setHasChosenLanguage(true);
    } catch (e) {
      console.warn('LocalStorage error:', e);
      setHasChosenLanguage(true);
    }
  }, []);

  const selectLanguage = (lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('ams_language', lang);
    } catch (e) {
      console.warn('Failed to save language:', e);
    }
    setHasChosenLanguage(true);
  };

  const toggleLanguage = () => {
    const next = language === 'hi' ? 'en' : 'hi';
    selectLanguage(next);
  };

  const t = (key) => {
    const currentDict = translations[language] || translations.hi;
    return currentDict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: selectLanguage, toggleLanguage, hasChosenLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: 'hi',
      setLanguage: () => {},
      toggleLanguage: () => {},
      hasChosenLanguage: true,
      t: (key) => (translations.hi && translations.hi[key]) || (translations.en && translations.en[key]) || key
    };
  }
  return ctx;
}
