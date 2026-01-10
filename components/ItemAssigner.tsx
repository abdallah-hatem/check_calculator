"use client";

import React, { useState } from "react";
import { ScannedItem } from "@/app/actions/scan";
import { Participant } from "@/utils/calculator";
import { Check, User, Plus, Trash2, X } from "lucide-react";

interface ItemAssignerProps {
  items: ScannedItem[];
  participants: Participant[];
  assignedItems: Record<string, string>;
  onAssign: (itemId: string, participantId: string, itemPrice: number) => void;
  onUnassign: (
    itemId: string,
    participantId: string,
    itemPrice: number,
  ) => void;
  onRemoveParticipant: (id: string) => void;
}

export function ItemAssigner({
  items,
  participants,
  assignedItems,
  onAssign,
  onUnassign,
  onRemoveParticipant,
}: ItemAssignerProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleAssign = (participantId: string) => {
    if (!selectedItem) return;

    const item = items.find((i) => i.id === selectedItem);
    if (item) {
      onAssign(item.id, participantId, item.price);
      setSelectedItem(null); // Deselect
    }
  };

  const handleItemClick = (item: ScannedItem) => {
    const assigneeId = assignedItems[item.id];
    if (assigneeId) {
      // If already assigned, unassign it
      onUnassign(item.id, assigneeId, item.price);
    } else {
      // Select for assignment
      setSelectedItem(item.id === selectedItem ? null : item.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Scanned Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Scanned Items ({items.length})
            </h3>
            <div className="text-xs text-gray-500">
              {Object.keys(assignedItems).length} assigned / {items.length}{" "}
              total
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {items.map((item) => {
              const isAssigned = !!assignedItems[item.id];
              const assignedToName = isAssigned
                ? participants.find((p) => p.id === assignedItems[item.id])
                    ?.name
                : null;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isAssigned
                      ? "bg-green-500/10 border-green-500/20 opacity-70 hover:opacity-100 hover:border-red-500/30 hover:bg-red-500/5 group"
                      : selectedItem === item.id
                        ? "bg-purple-500/20 border-purple-500 ring-1 ring-purple-500"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {item.name}{" "}
                      {item.quantity > 1 ? `(x${item.quantity})` : ""}
                    </div>
                    {isAssigned && (
                      <div className="text-xs text-green-400 group-hover:text-red-400 flex items-center gap-1 mt-1">
                        <span className="group-hover:hidden flex items-center gap-1">
                          <Check className="h-3 w-3" /> Assigned to{" "}
                          {assignedToName}
                        </span>
                        <span className="hidden group-hover:flex items-center gap-1">
                          <X className="h-3 w-3" /> Unassign
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-white">
                    ${item.price.toFixed(2)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Friends to Assign To */}
        <div
          className={`space-y-4 ${!selectedItem ? "opacity-100" : ""} transition-all`}
        >
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            {selectedItem
              ? `Assign "${items.find((i) => i.id === selectedItem)?.name}" to...`
              : "Select an item to assign"}
          </h3>
          <div className="grid gap-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                <button
                  onClick={() => handleAssign(p.id)}
                  disabled={!selectedItem}
                  className={`flex-1 flex items-center gap-3 p-2 rounded-lg transition-all ${!selectedItem ? "cursor-default opacity-50" : "hover:bg-purple-500/20"}`}
                >
                  <div className="p-2 rounded-full bg-white/5">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <span className="font-medium text-white">
                    {p.name || "Unnamed Friend"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Remove ${p.name}?`)) {
                      onRemoveParticipant(p.id);
                    }
                  }}
                  className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {participants.length === 0 && (
            <div className="text-center p-4 text-gray-500 border border-dashed border-white/10 rounded-xl">
              Add friends below to assign items!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
