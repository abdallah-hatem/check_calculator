"use client";

import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  BillDetails,
  Participant,
  calculateSplits,
  calculateSettlements,
} from "@/utils/calculator";
import { BillInput } from "./BillInput";
import { ParticipantList } from "./ParticipantList";
import { SettlementDisplay } from "./SettlementDisplay";
import { ReceiptUploader } from "./ReceiptUploader";
import { ItemAssigner } from "./ItemAssigner";
import { ScanResult, ScannedItem } from "@/app/actions/scan";
import {
  Wallet,
  Calculator as CalculatorIcon,
  X,
  ArrowLeft,
} from "lucide-react";

export function Calculator() {
  const resultsRef = useRef<HTMLDivElement>(null);

  // UI Modes
  const [showResults, setShowResults] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Data State
  const [bill, setBill] = useState<BillDetails>({
    delivery: 0,
    tax: 0,
    service: 0,
  });

  const [targetTotal, setTargetTotal] = useState<number | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "Mina", orderedAmount: 0, paidAmount: 0 },
    { id: "2", name: "Hossam", orderedAmount: 0, paidAmount: 0 },
    { id: "3", name: "Hatem", orderedAmount: 0, paidAmount: 0 },
    { id: "4", name: "Salah", orderedAmount: 0, paidAmount: 0 },
    { id: "5", name: "Safwat", orderedAmount: 0, paidAmount: 0 },
  ]);

  // Scanned Data State
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [assignedItems, setAssignedItems] = useState<Record<string, string>>(
    {},
  );

  const handleBillChange = (key: keyof BillDetails, value: number) => {
    setBill((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddParticipant = (initialName: string = "") => {
    // If in scanner mode and no name provided, ask for one to ensure they identify the button
    let nameToUse = initialName;
    if (showScanner && !nameToUse) {
      const userEntry = window.prompt("Enter new friend's name:");
      if (userEntry === null) return; // Cancelled
      nameToUse = userEntry || "New Friend";
    }

    setParticipants((prev) => [
      ...prev,
      { id: uuidv4(), name: nameToUse, orderedAmount: 0, paidAmount: 0 },
    ]);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    // Clear any assignments for this participant so items become available again
    setAssignedItems((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((itemId) => {
        if (next[itemId] === id) {
          delete next[itemId];
        }
      });
      return next;
    });
  };

  const handleParticipantUpdate = (
    id: string,
    field: keyof Participant,
    value: any,
  ) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const handleScanComplete = (data: ScanResult) => {
    // 1. Update Global Fees
    setBill({
      delivery: data.delivery,
      tax: data.tax,
      service: data.service,
    });

    // 2. Set Target Total if found
    if (data.total > 0) {
      setTargetTotal(data.total);
    }

    // 3. Store Items & formatting
    setScannedItems(data.items);

    // Reset assignments on new scan
    setAssignedItems({});

    // 4. Switch to assignment view? (Or just show them)
    // We already in "Scanner" view which contains the assigner, so we just populate it.
  };

  const handleAssignItem = (
    itemId: string,
    participantId: string,
    itemPrice: number,
  ) => {
    // Add price to participant's ordered amount
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          return { ...p, orderedAmount: p.orderedAmount + itemPrice };
        }
        return p;
      }),
    );
    // Track assignment
    setAssignedItems((prev) => ({ ...prev, [itemId]: participantId }));
  };

  const handleUnassignItem = (
    itemId: string,
    participantId: string,
    itemPrice: number,
  ) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          // Avoid negative amounts just in case
          const newAmount = Math.max(0, p.orderedAmount - itemPrice);
          return { ...p, orderedAmount: newAmount };
        }
        return p;
      }),
    );
    setAssignedItems((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const results = calculateSplits(participants, bill);
  const settlements = calculateSettlements(results);

  const totalBill =
    participants.reduce((sum, p) => sum + p.orderedAmount, 0) +
    bill.delivery +
    bill.tax +
    bill.service;

  const totalPaid = participants.reduce((sum, p) => sum + p.paidAmount, 0);

  const isPaidMatched = Math.abs(totalPaid - totalBill) < 0.1;
  const isTargetMatched = targetTotal
    ? Math.abs(targetTotal - totalBill) < 0.1
    : true;

  // View Switching Logic
  if (showScanner) {
    return (
      <div className="pb-32 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowScanner(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h2 className="text-xl font-bold text-white">Scan & Assign</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">
                1. Upload Receipt
              </h3>
              <ReceiptUploader onScanComplete={handleScanComplete} />
            </div>
          </div>

          <div className="space-y-6">
            {scannedItems.length > 0 && (
              <div className="p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl animate-in slide-in-from-right-4 duration-500">
                <h3 className="text-lg font-bold text-white mb-4">
                  2. Assign Items
                </h3>
                <ItemAssigner
                  items={scannedItems}
                  participants={participants}
                  assignedItems={assignedItems}
                  onAssign={handleAssignItem}
                  onUnassign={handleUnassignItem}
                  onRemoveParticipant={handleRemoveParticipant}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer for quick participant add during scan */}
        {scannedItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/90 backdrop-blur-md border-t border-white/10 z-50">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <button
                onClick={() => handleAddParticipant()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg text-sm"
              >
                + Add Friend
              </button>

              <button
                onClick={() => setShowScanner(false)}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 active:scale-95 transition-all text-center"
              >
                Done Assigning ({scannedItems.length} items)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-32">
      {/* Top Action: Scan */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowScanner(true)}
          className="px-6 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:text-white hover:bg-purple-500 rounded-xl transition-all font-medium flex items-center gap-2"
        >
          ✨ Scan Receipt with AI
        </button>
      </div>

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
            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">
              Total Bill
            </div>
            <div
              className={`text-xl font-bold ${!isTargetMatched ? "text-red-400" : "text-white"}`}
            >
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
              <div
                className={`p-4 rounded-xl border ${isPaidMatched ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`font-semibold ${isPaidMatched ? "text-green-400" : "text-red-400"}`}
                  >
                    {isPaidMatched
                      ? "Total Paid Matches Bill ✅"
                      : "Payment Mismatch ⚠️"}
                  </span>
                </div>
                {!isPaidMatched && (
                  <div className="mt-1 text-sm text-gray-400">
                    Friends paid ${totalPaid.toFixed(2)} but bill is $
                    {totalBill.toFixed(2)}.
                  </div>
                )}
              </div>

              <SettlementDisplay
                settlements={settlements}
                participants={results}
              />

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
