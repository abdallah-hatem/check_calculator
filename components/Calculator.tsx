"use client";

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BillDetails, Participant, calculateSplits, calculateSettlements } from '@/utils/calculator';
import { BillInput } from './BillInput';
import { ParticipantList } from './ParticipantList';
import { SettlementDisplay } from './SettlementDisplay';
import { Wallet, Calculator as CalculatorIcon, X } from 'lucide-react';

export function Calculator() {
  const [showResults, setShowResults] = useState(false);
  
  const [bill, setBill] = useState<BillDetails>({
    delivery: 0,
    tax: 0,
    service: 0,
  });
  
  const [targetTotal, setTargetTotal] = useState<number | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: '', orderedAmount: 0, paidAmount: 0 },
    { id: '2', name: '', orderedAmount: 0, paidAmount: 0 },
  ]);

  const handleBillChange = (key: keyof BillDetails, value: number) => {
    setBill((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      { id: uuidv4(), name: '', orderedAmount: 0, paidAmount: 0 },
    ]);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const handleParticipantUpdate = (id: string, field: keyof Participant, value: any) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const results = calculateSplits(participants, bill);
  const settlements = calculateSettlements(results);

  const totalBill = 
    participants.reduce((sum, p) => sum + p.orderedAmount, 0) + 
    bill.delivery + bill.tax + bill.service;

  const totalPaid = participants.reduce((sum, p) => sum + p.paidAmount, 0);
  
  const isPaidMatched = Math.abs(totalPaid - totalBill) < 0.1;
  const isTargetMatched = targetTotal ? Math.abs((targetTotal) - totalBill) < 0.1 : true;

  return (
    <div className="flex flex-col gap-8 w-full pb-32">
      {/* Input Section */}
      <div className="space-y-6">
        {/* Bill Details Card */}
        <div className="p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CalculatorIcon className="h-6 w-6 text-purple-400" />
            Bill Details
          </h2>
          <BillInput 
            bill={bill} 
            onChange={handleBillChange} 
            targetTotal={targetTotal}
            onTargetTotalChange={setTargetTotal}
            calculatedTotal={totalBill}
          />
        </div>

        {/* Participants Card */}
        <div className="p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl">
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-blue-400" />
            Friends & Orders
          </h2>
          <ParticipantList
            participants={participants}
            onAdd={handleAddParticipant}
            onRemove={handleRemoveParticipant}
            onUpdate={handleParticipantUpdate}
          />
        </div>
      </div>

      {/* Floating Action Bar / Calculate Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/90 backdrop-blur-md border-t border-white/10 z-50">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
              <div className="flex-1">
                  <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Bill</div>
                  <div className={`text-xl font-bold ${!isTargetMatched ? 'text-red-400' : 'text-white'}`}>
                      ${totalBill.toFixed(2)}
                  </div>
              </div>
              <button
                  onClick={() => setShowResults(true)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 flex items-center gap-2 active:scale-95 transition-transform"
              >
                  <CalculatorIcon className="h-5 w-5" />
                  Calculate
              </button>
          </div>
      </div>

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-300">
                <button 
                  onClick={() => setShowResults(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-white">Split Results</h2>
                    
                    {/* Status Check in Modal */}
                    <div className={`p-4 rounded-xl border ${isPaidMatched ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className="flex justify-between items-center">
                            <span className={`font-semibold ${isPaidMatched ? 'text-green-400' : 'text-red-400'}`}>
                                {isPaidMatched ? 'Total Paid Matches Bill ✅' : 'Payment Mismatch ⚠️'}
                            </span>
                        </div>
                        {!isPaidMatched && (
                             <div className="mt-1 text-sm text-gray-400">
                                Friends paid ${totalPaid.toFixed(2)} but bill is ${totalBill.toFixed(2)}.
                             </div>
                        )}
                    </div>

                    <SettlementDisplay settlements={settlements} participants={results} />
                    
                    <button
                        onClick={() => setShowResults(false)}
                        className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
                    >
                        Back to Edit
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
