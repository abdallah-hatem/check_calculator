import React from 'react';
import { Receipt, Truck, Percent, Calculator } from 'lucide-react';
import { BillDetails } from '@/utils/calculator';
import { cn } from '@/lib/utils';

interface BillInputProps {
  bill: BillDetails;
  onChange: (key: keyof BillDetails, value: number) => void;
  targetTotal: number | null;
  onTargetTotalChange: (val: number | null) => void;
  calculatedTotal: number;
}

export function BillInput({ bill, onChange, targetTotal, onTargetTotalChange, calculatedTotal }: BillInputProps) {
  const inputs = [
    { key: 'delivery', label: 'Delivery Fee', icon: Truck, color: 'text-blue-400' },
    { key: 'tax', label: 'Tax', icon: Receipt, color: 'text-green-400' },
    { key: 'service', label: 'Service Fee', icon: Percent, color: 'text-yellow-400' },
  ] as const;

  const difference = targetTotal ? targetTotal - calculatedTotal : 0;
  const isMatch = Math.abs(difference) < 0.1;

  return (
    <div className="space-y-6">
      {/* Target Total Input */}
      <div className="relative group">
          <label className="text-xs text-gray-400 ml-1 mb-1 block uppercase tracking-wider font-semibold">
            Receipt Total (Target)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calculator className="h-4 w-4 text-purple-400" />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={targetTotal ?? ''}
              onChange={(e) => onTargetTotalChange(e.target.value ? parseFloat(e.target.value) : null)}
              className={cn(
                "block w-full pl-10 pr-3 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-200 text-white placeholder-gray-500 text-lg font-bold",
                targetTotal && !isMatch ? "border-red-500/50" : "border-white/10"
              )}
              placeholder="Enter Total Bill Amount..."
            />
          </div>
          {targetTotal && !isMatch && (
             <div className="mt-2 text-xs text-red-400 font-medium animate-pulse">
                Order total is off by ${difference.toFixed(2)}
             </div>
          )}
           {targetTotal && isMatch && (
             <div className="mt-2 text-xs text-green-400 font-medium">
                Perfect match!
             </div>
          )}
      </div>

      <div className="border-t border-white/10 my-4"></div>

      {/* Fees */}
      <div className="grid grid-cols-2 gap-4">
        {inputs.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="relative group">
            <label className="text-xs text-gray-400 ml-1 mb-1 block uppercase tracking-wider font-semibold">
              {label}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={bill[key] || ''}
                onChange={(e) => onChange(key, parseFloat(e.target.value) || 0)}
                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg 
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                         text-white placeholder-gray-500 transition-all duration-200
                         hover:bg-white/10"
                placeholder="0.00"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
