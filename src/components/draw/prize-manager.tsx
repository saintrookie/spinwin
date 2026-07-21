"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useDraw } from "@/context/draw-context";
import { api } from "@/lib/api-client";

export function PrizeManager() {
  const { state, refreshAll } = useDraw();
  const { prizes, currentPrize } = state;

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!name.trim()) {
      toast.error("Prize name is required");
      return;
    }
    const qty = Number(quantity) || 1;
    setSaving(true);
    try {
      await api.createPrize({
        name: name.trim(),
        description: description.trim() || undefined,
        quantity: qty,
        displayOrder: prizes.length,
      });
      setName("");
      setDescription("");
      setQuantity("1");
      await refreshAll();
      toast.success("Prize added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add prize");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deletePrize(id);
      await refreshAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete prize");
    }
  }

  async function handleSetCurrent(id: string) {
    try {
      await api.updateSettings({ currentPrizeId: id });
      await refreshAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not select prize");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-lg border-2 border-foreground p-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-1">
            <Label htmlFor="prize-name">Name</Label>
            <Input id="prize-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Grand Prize" />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="prize-qty">Quantity</Label>
            <Input
              id="prize-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="prize-desc">Description (optional)</Label>
          <Input
            id="prize-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brand new laptop"
          />
        </div>
        <Button size="sm" onClick={handleAdd} disabled={saving} className="self-end">
          <Plus /> Add prize
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {prizes.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-4">No prizes yet</p>
        )}
        {prizes.map((prize) => (
          <div
            key={prize.id}
            className="flex items-center justify-between gap-2 rounded-lg border-2 border-foreground px-3 py-2"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{prize.name}</span>
                {currentPrize?.id === prize.id && <Badge>Current</Badge>}
              </div>
              <div className="text-muted-foreground text-xs">
                {prize.awardedCount}/{prize.quantity} awarded
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSetCurrent(prize.id)}
                aria-label="Set as current prize"
                title="Set as current prize"
              >
                <Star className={currentPrize?.id === prize.id ? "fill-secondary text-secondary-foreground" : ""} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(prize.id)}
                aria-label="Delete prize"
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
