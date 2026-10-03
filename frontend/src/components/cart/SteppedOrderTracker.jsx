import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Check,
  XCircle,
  AlertCircle
} from 'lucide-react';

const STEPS = [
  { key: 'Pending', label: 'Order Placed', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'Packed', label: 'Packed', icon: Package },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: MapPin },
  { key: 'Delivered', label: 'Delivered', icon: Check }
];

export const SteppedOrderTracker = ({ currentStatus, timeline = [] }) => {
  const isCancelled = currentStatus === 'Cancelled';
  const isPaymentFailed = currentStatus === 'Payment Failed';

  if (isCancelled || isPaymentFailed) {
    return (
      <div className={`p-6 rounded-3xl border ${isCancelled ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'} mb-8`}>
        <div className="flex items-center gap-3 mb-2">
          {isCancelled ? (
            <XCircle className="w-6 h-6 text-rose-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-600" />
          )}
          <h4 className={`text-base font-bold ${isCancelled ? 'text-rose-900' : 'text-amber-900'}`}>
            Order Status: {currentStatus}
          </h4>
        </div>
        <p className={`text-sm ${isCancelled ? 'text-rose-700' : 'text-amber-700'}`}>
          {isCancelled
            ? 'This order was cancelled and inventory has been released.'
            : 'Payment verification failed. You can re-attempt checkout or contact support.'}
        </p>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm mb-8">
      <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center justify-between">
        <span>Live Shipment Progression</span>
        <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full">
          Current: {currentStatus}
        </span>
      </h3>

      {/* Stepper Bar */}
      <div className="relative">
        {/* Connecting Line */}
        <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-100 -z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-700"
            style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            // Find timestamp from timeline if exists
            const timelineEntry = timeline.find((t) => t.status === step.key);

            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                {/* Step Circle */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm mb-2 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-blue-600 text-white shadow-blue-500/30 ring-4 ring-blue-100 scale-110'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Step Label */}
                <span
                  className={`text-xs font-bold leading-tight ${
                    isCurrent
                      ? 'text-blue-600'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>

                {/* Timestamp */}
                {timelineEntry && (
                  <span className="text-[10px] text-slate-400 mt-1">
                    {new Date(timelineEntry.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
