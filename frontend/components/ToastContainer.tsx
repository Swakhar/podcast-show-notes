import React from 'react';
import { useToast } from '../contexts/ToastContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <>
      {/* Desktop positioning */}
      <div className="hidden sm:block fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
        <div className="flex flex-col items-end space-y-3">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast toast={toast} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile positioning */}
      <div className="sm:hidden fixed top-4 left-4 right-4 z-50 space-y-3 pointer-events-none">
        <div className="flex flex-col space-y-3">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast toast={toast} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ToastContainer;
