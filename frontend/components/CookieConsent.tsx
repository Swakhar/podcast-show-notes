import { useEffect, useState } from "react";
import { useTranslation } from 'next-i18next';

export default function CookieConsent() {
  const { t } = useTranslation('common');
  const KEY = "cookie-consent-v1";
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const v = localStorage.getItem(KEY);
    if (!v) setShow(true);
  }, []);
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[92vw] rounded-xl border bg-white shadow-lg p-4">
      <p className="text-sm text-slate-700">
        {t('cookieConsent.message')}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button 
          className="px-3 py-1.5 border rounded-md" 
          onClick={() => { 
            localStorage.setItem(KEY, "decline"); 
            setShow(false); 
          }}
        >
          {t('cookieConsent.buttons.decline')}
        </button>
        <button 
          className="px-3 py-1.5 rounded-md bg-[#9CEE69] text-slate-900 font-semibold" 
          onClick={() => { 
            localStorage.setItem(KEY, "accept"); 
            setShow(false); 
          }}
        >
          {t('cookieConsent.buttons.accept')}
        </button>
      </div>
    </div>
  );
}
