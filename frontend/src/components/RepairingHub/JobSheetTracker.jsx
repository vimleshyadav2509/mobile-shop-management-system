import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, Wrench, PackageCheck, AlertCircle, MessageCircle, FileText, Smartphone, History } from 'lucide-react';
import { fetchRepairStatus, fetchRepairHistory } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { SHOP_INFO } from '../../data/mockData';

export default function JobSheetTracker() {
  const { t, language } = useLanguage();
  const [jobId, setJobId] = useState('AMS-101');
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const TRACKING_STAGES = [
    { id: 'Received', label: t('stage_received'), desc: t('stage_received_desc'), icon: FileText },
    { id: 'In Repair', label: t('stage_in_repair'), desc: t('stage_in_repair_desc'), icon: Wrench },
    { id: 'Ready for Pickup', label: t('stage_ready'), desc: t('stage_ready_desc'), icon: PackageCheck },
    { id: 'Delivered', label: t('stage_delivered'), desc: t('stage_delivered_desc'), icon: CheckCircle2 },
  ];

  const handleTrack = async (idToTrack = null) => {
    const targetId = (idToTrack || jobId).trim();
    if (!targetId) {
      setError(language === 'hi' ? 'कृपया सही रसीद / जॉब शीट नंबर दर्ज करें' : 'Please enter a valid Job Sheet ID');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const data = await fetchRepairStatus(targetId);
      setJobData(data);
      try {
        const histData = await fetchRepairHistory(targetId);
        setHistory(Array.isArray(histData) ? histData : []);
      } catch {
        setHistory([]);
      }
    } catch (err) {
      setJobData(null);
      setHistory([]);
      setError(err.message || 'Job Sheet ID not found.');
    } finally {
      setLoading(false);
    }
  };

  const getStageIndex = (status) => {
    if (!status) return 0;
    const s = status.toLowerCase();
    if (s.includes('deliver') || s.includes('complete')) return 3;
    if (s.includes('ready') || s.includes('pickup') || s.includes('quality')) return 2;
    if (s.includes('repair') || s.includes('parts') || s.includes('diagno') || s.includes('approval')) return 1;
    return 0;
  };

  const currentStageIdx = jobData ? getStageIndex(jobData.status) : 0;

  const handleWhatsAppStatusInquiry = () => {
    if (!jobData) return;
    const text = language === 'hi'
      ? `नमस्ते Amit Mobile Shop, मेरी रिपेयरिंग रसीद नंबर *${jobData.job_sheet_id}* (${jobData.device_brand} ${jobData.device_model}) का स्टेटस जानना है। क्या फोन तैयार हो गया है?`
      : `Hello Amit Mobile Shop, I want an update on my repair Job Sheet *${jobData.job_sheet_id}* (${jobData.device_brand} ${jobData.device_model}). Status is "${jobData.status}". When can I collect it?`;

    const url = `https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="rounded-3xl bg-white border-2 border-slate-200 p-6 sm:p-8 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-whatsapp-50 text-whatsapp-700 text-xs font-bold mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>लाइव रसीद ट्रैकिंग (Receipt Tracking)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-['Poppins']">
            {t('tracker_heading')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            {t('tracker_subheading')}
          </p>
        </div>
      </div>

      {/* Search Input & Demo Chips */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value.toUpperCase())}
              placeholder={t('tracker_input_placeholder')}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl retail-input text-sm font-mono uppercase font-black"
            />
          </div>
          <button
            onClick={() => handleTrack()}
            disabled={loading}
            className="px-7 py-3.5 rounded-2xl bg-primary-700 hover:bg-primary-800 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? (language === 'hi' ? 'चेक कर रहे हैं...' : 'Checking...') : t('tracker_btn')}
          </button>
        </div>

        {/* Quick Demo Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-bold">{t('quick_test_chips')}</span>
          {['AMS-101', 'AMS-102', 'AMS-103', 'AMS-104'].map((demoId) => (
            <button
              key={demoId}
              type="button"
              onClick={() => {
                setJobId(demoId);
                handleTrack(demoId);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-primary-800 text-xs font-mono font-bold transition"
            >
              {demoId}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2.5 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Result Banner & Timeline */}
      {jobData && (
        <div className="mt-8 space-y-6 animate-in fade-in duration-200">
          
          {/* Status Header Banner */}
          <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-md bg-primary-700 text-white font-mono text-xs font-black">
                  रसीद: {jobData.job_sheet_id}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  दिनांक: {jobData.created_at || 'आज'}
                </span>
              </div>
              <h4 className="text-lg font-black text-slate-900 mt-1.5 flex items-center gap-2 font-['Poppins']">
                <Smartphone className="w-5 h-5 text-primary-600" />
                <span>{jobData.device_brand} {jobData.device_model}</span>
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">वर्तमान स्थिति:</span>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                jobData.status === 'Ready for Pickup'
                  ? 'bg-whatsapp-50 text-whatsapp-700 border-2 border-whatsapp-300'
                  : jobData.status === 'In Repair'
                  ? 'bg-gold-50 text-gold-700 border-2 border-gold-300'
                  : 'bg-primary-50 text-primary-800 border-2 border-primary-300'
              }`}>
                {jobData.status}
              </span>
            </div>
          </div>

          {/* Stepped Progress Timeline */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="relative">
              
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-slate-200">
                <div
                  className="h-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${(currentStageIdx / (TRACKING_STAGES.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                {TRACKING_STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isCompleted = idx <= currentStageIdx;
                  const isCurrent = idx === currentStageIdx;

                  return (
                    <div key={stage.id} className="flex sm:flex-col items-center sm:text-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all duration-200 ${
                        isCurrent
                          ? 'bg-primary-700 text-white ring-4 ring-primary-100 shadow-md'
                          : isCompleted
                          ? 'bg-whatsapp-600 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`text-xs font-black block ${
                          isCurrent ? 'text-primary-800' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                        }`}>
                          {stage.label}
                        </span>
                        <span className="text-[11px] text-slate-500 hidden sm:block font-medium">
                          {stage.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Diagnosis & Notes Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-medium">
              <div>
                <span className="text-slate-500 block font-bold">{t('cust_name_label')}</span>
                <span className="font-bold text-slate-900 text-sm">{jobData.customer_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-bold">{t('issue_label')}</span>
                <span className="font-bold text-slate-900 text-sm">{jobData.issue_type}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-bold">{t('est_bill_label')}</span>
                <span className="font-black text-primary-700 font-mono text-base">
                  ₹{jobData.estimated_cost?.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-bold">{t('handled_by_label')}</span>
                <span className="font-bold text-slate-900">
                  {jobData.technician_name || 'Amit Mobile Shop Expert'}
                </span>
              </div>
            </div>

            {/* Technician Note */}
            {jobData.technician_notes && (
              <div className="pt-3 border-t border-slate-200">
                <span className="text-slate-600 font-bold block mb-1">
                  {t('tech_note_label')}
                </span>
                <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed font-semibold">
                  {jobData.technician_notes}
                </p>
              </div>
            )}
          </div>

          {/* Status History Timeline */}
          {history.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <History className="w-4 h-4 text-primary-600" />
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  {language === 'hi' ? 'स्थिति अपडेट इतिहास (Update History)' : 'Status Updates & Timeline'}
                </h5>
              </div>
              <div className="space-y-2.5">
                {history.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="w-2 h-2 rounded-full bg-primary-600 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="font-bold text-slate-900">
                          {item.new_status}
                          {item.old_status && item.old_status !== item.new_status && (
                            <span className="text-slate-400 font-normal ml-1">
                              (from {item.old_status})
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.created_at ? new Date(item.created_at).toLocaleString('en-IN') : ''}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-[11px] text-slate-600 mt-1 italic">
                          "{item.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp Status Chat Button */}
          <button
            onClick={handleWhatsAppStatusInquiry}
            className="w-full py-4 rounded-2xl bg-whatsapp-600 hover:bg-whatsapp-700 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('track_wa_inquiry')}</span>
          </button>

        </div>
      )}

    </div>
  );
}
