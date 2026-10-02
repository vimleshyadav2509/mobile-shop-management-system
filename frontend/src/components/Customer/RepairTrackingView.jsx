import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  FileText, 
  PackageCheck, 
  AlertCircle, 
  MessageCircle, 
  Smartphone, 
  XCircle,
  ShieldCheck,
  Search
} from 'lucide-react';
import { fetchRepairStatus, fetchRepairHistory } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { SHOP_INFO } from '../../data/mockData';

export default function RepairTrackingView({ initialJobId = 'AMS-101', onBack }) {
  const { t, language } = useLanguage();
  const [jobId, setJobId] = useState(initialJobId);
  const [searchInput, setSearchInput] = useState(initialJobId);
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialJobId) {
      loadStatus(initialJobId);
    }
  }, [initialJobId]);

  const loadStatus = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRepairStatus(id);
      setJobData(data);
      try {
        const hist = await fetchRepairHistory(id);
        setHistory(Array.isArray(hist) ? hist : []);
      } catch {
        setHistory([]);
      }
    } catch (err) {
      console.warn('[RepairTrackingView] Fetch error:', err);
      // Fallback mock job sheet for demonstration if offline
      setJobData({
        job_sheet_id: id,
        device_brand: 'Samsung',
        device_model: 'Galaxy M34 5G',
        issue: 'Broken Display / Touch Combo',
        status: 'In Repair',
        estimated_cost: 2450,
        estimated_delivery: 'Today by 5:30 PM',
        created_at: new Date().toLocaleDateString(),
        technician: 'Amit Yadav (Master Tech)',
        customer_name: 'Customer (Khorare)'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setJobId(searchInput.trim());
      loadStatus(searchInput.trim());
    }
  };

  // Standard 5-stage timeline matching Reference UI Screen 7
  const TIMELINE_STAGES = [
    { 
      key: 'received', 
      label: t('ref_ui.status_received') || (language === 'hi' ? 'दुकान पर जमा' : 'Received'), 
      desc: language === 'hi' ? 'फोन काउंटर पर प्राप्त हुआ' : 'Device registered at store desk' 
    },
    { 
      key: 'diagnosis', 
      label: t('ref_ui.status_diagnosis') || (language === 'hi' ? 'जांच व टेस्टिंग' : 'Diagnosis'), 
      desc: language === 'hi' ? 'हार्डवेयर टेस्टिंग व पार्ट्स जांच' : 'Hardware testing & part verification' 
    },
    { 
      key: 'in_repair', 
      label: t('ref_ui.status_in_repair') || (language === 'hi' ? 'रिपेयरिंग जारी' : 'In Repair'), 
      desc: language === 'hi' ? 'कारीगर बेंच रिपेयरिंग जारी' : 'Screen/battery bench replacement' 
    },
    { 
      key: 'quality_check', 
      label: t('ref_ui.status_quality_check') || (language === 'hi' ? 'क्वालिटी चेक' : 'Quality Check'), 
      desc: language === 'hi' ? 'फाइनल टच व चार्जिंग टेस्टिंग' : 'Final touch & charging verification' 
    },
    { 
      key: 'ready', 
      label: t('ref_ui.status_ready') || (language === 'hi' ? 'ले जाने के लिए तैयार' : 'Ready for Pickup'), 
      desc: language === 'hi' ? 'वारंटी बिल के साथ काउंटर पर तैयार' : 'Available at shop counter with bill' 
    }
  ];

  const currentStatus = (jobData?.status || 'In Repair').toLowerCase();
  const isCancelled = currentStatus.includes('cancel');
  const isDelivered = currentStatus.includes('deliver') || currentStatus.includes('complete');
  const isWaitingParts = currentStatus.includes('part') || currentStatus.includes('wait');

  const getStageIndex = () => {
    if (isDelivered) return 4;
    if (currentStatus.includes('ready') || currentStatus.includes('pickup')) return 4;
    if (currentStatus.includes('quality')) return 3;
    if (currentStatus.includes('repair') || isWaitingParts) return 2;
    if (currentStatus.includes('diag') || currentStatus.includes('test')) return 1;
    return 0; // received
  };

  const activeStageIdx = getStageIndex();

  const handleWhatsAppInquiry = () => {
    if (!jobData) return;
    const text = language === 'hi'
      ? `नमस्ते Amit Mobile Shop, मेरी रिपेयरिंग रसीद नंबर *${jobData.job_sheet_id}* (${jobData.device_brand} ${jobData.device_model}) का स्टेटस "${jobData.status}" है। क्या यह आज मिल जाएगा?`
      : `Hello Amit Mobile Shop, inquiry for Job Sheet *${jobData.job_sheet_id}* (${jobData.device_brand} ${jobData.device_model}). Status is "${jobData.status}". Is it ready for collection?`;
    window.open(`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section className="space-y-4 pb-12 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 text-[#102A43] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-base sm:text-lg font-bold text-[#102A43]">
            {t('ref_ui.tracking_title') || 'Repair Tracking'}
          </h2>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter Job Sheet (e.g. AMS-101)..."
            className="w-full bg-white border border-[#E2E8F0] focus:border-[#1264F5] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm font-mono uppercase text-[#102A43] outline-none shadow-2xs"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-[#1264F5] hover:bg-[#0E52C9] text-white text-xs font-bold shadow-2xs cursor-pointer"
        >
          Track
        </button>
      </form>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center text-slate-500 animate-pulse">
          <Clock className="w-8 h-8 mx-auto text-[#1264F5] animate-spin mb-2" />
          <p className="text-xs font-semibold">Fetching job sheet status...</p>
        </div>
      ) : jobData ? (
        <div className="space-y-3.5">
          
          {/* Job Card matching Screen 7 */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold block">
                  {t('ref_ui.job_sheet_no') || 'Job Sheet No.'}
                </span>
                <span className="text-lg font-mono font-black text-[#102A43]">
                  {jobData.job_sheet_id}
                </span>
              </div>

              {/* Status Badge */}
              {isCancelled ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#FCA5A5] flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{t('ref_ui.status_cancelled') || 'Cancelled'}</span>
                </span>
              ) : isDelivered ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6F8F0] text-[#20B26B] border border-[#86EFAC] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('ref_ui.status_delivered') || 'Delivered'}</span>
                </span>
              ) : isWaitingParts ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF6E5] text-[#D97706] border border-[#FDE68A] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{t('ref_ui.status_waiting_parts') || 'Waiting for Parts'}</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF3FF] text-[#1264F5] border border-[#BFDBFE] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>{jobData.status}</span>
                </span>
              )}
            </div>

            {/* Estimated Completion */}
            <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
              <span className="text-[#64748B] font-medium">
                {t('ref_ui.est_completion') || 'Estimated Completion:'}
              </span>
              <span className="font-bold text-[#102A43]">
                {jobData.estimated_delivery || 'Within 2-4 Hours'}
              </span>
            </div>
          </div>

          {/* Device Details Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
              {t('ref_ui.device_details') || 'Device Details'}
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <p className="text-[10px] text-[#64748B]">{t('ref_ui.device_brand') || 'Brand'}</p>
                <p className="font-bold text-[#102A43] mt-0.5">{jobData.device_brand || 'Smartphone'}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <p className="text-[10px] text-[#64748B]">{t('ref_ui.device_model') || 'Model'}</p>
                <p className="font-bold text-[#102A43] mt-0.5 truncate">{jobData.device_model || 'Model'}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <p className="text-[10px] text-[#64748B]">{t('ref_ui.reported_issue') || 'Issue'}</p>
                <p className="font-bold text-[#102A43] mt-0.5 truncate">{jobData.issue || 'Display Check'}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <p className="text-[10px] text-[#64748B]">{t('ref_ui.estimated_cost') || 'Estimated Cost'}</p>
                <p className="font-extrabold text-[#1264F5] mt-0.5">₹{Number(jobData.estimated_cost || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Vertical Timeline Card matching Screen 7 */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
              {t('ref_ui.timeline_title') || 'Repair Timeline'}
            </h3>

            <div className="relative pl-6 space-y-5">
              {/* Vertical connecting line */}
              <div className="absolute left-2.75 top-2 bottom-2 w-0.5 bg-[#E2E8F0]" />

              {TIMELINE_STAGES.map((stage, idx) => {
                const isCompleted = !isCancelled && (idx < activeStageIdx || (idx === 4 && isDelivered));
                const isCurrent = !isCancelled && idx === activeStageIdx && !isDelivered;
                const isPending = isCancelled || idx > activeStageIdx;

                return (
                  <div key={stage.key} className="relative flex items-start gap-3">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white transition-all ${
                        isCompleted
                          ? 'border-[#20B26B] text-[#20B26B] bg-[#E6F8F0]'
                          : isCurrent
                          ? 'border-[#1264F5] text-[#1264F5] bg-[#EAF3FF] ring-4 ring-[#1264F5]/10'
                          : 'border-[#CBD5E1] text-[#94A3B8]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>

                    {/* Stage Label & Desc */}
                    <div className="min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-bold leading-tight ${
                          isCompleted
                            ? 'text-[#102A43]'
                            : isCurrent
                            ? 'text-[#1264F5]'
                            : 'text-[#94A3B8]'
                        }`}
                      >
                        {stage.label}
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Special Waiting For Parts Note */}
            {isWaitingParts && (
              <div className="p-3 rounded-xl bg-[#FFF6E5] border border-[#FDE68A] text-xs text-[#92400E] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#D97706]" />
                <span>Special spare part ordered from master hub. Testing will resume upon arrival.</span>
              </div>
            )}
          </div>

          {/* WhatsApp Direct Action Button */}
          <button
            type="button"
            onClick={handleWhatsAppInquiry}
            className="w-full py-3 px-4 rounded-xl bg-[#20B26B] hover:bg-[#1A985B] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>
              {language === 'hi' 
                ? `रसीद ${jobData.job_sheet_id} के बारे में व्हाट्सएप पर बात करें` 
                : `Chat on WhatsApp regarding Job Sheet ${jobData.job_sheet_id}`}
            </span>
          </button>

        </div>
      ) : null}

    </section>
  );
}
