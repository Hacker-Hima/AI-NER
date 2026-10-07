import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const DisclaimerBanner = () => {
  return (
    <div className="bg-amber-950/40 border-b border-amber-800/50 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-5xl mx-auto">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
        <span>
          <strong className="font-semibold text-amber-200">Educational SIH Simulation Prototype:</strong> All terrain hazards, landslide alerts, and alternate routing advisories are computed by academic ML simulations and open meteorological APIs. Not authorized for official state emergency dispatch.
        </span>
      </div>
    </div>
  );
};
