"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useDraw } from "@/context/draw-context";
import { PrizeManager } from "@/components/draw/prize-manager";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsPanel({ open, onOpenChange }: Props) {
  const { state, updateSettings } = useDraw();
  const { settings } = state;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="prizes" className="flex-1">Prizes</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="roll-duration">Draw duration (ms)</Label>
              <Input
                id="roll-duration"
                type="number"
                min={500}
                step={250}
                value={settings?.rollDurationMs ?? 4000}
                onChange={(e) => updateSettings({ rollDurationMs: Number(e.target.value) })}
              />
              <p className="text-muted-foreground text-xs">
                How long the reveal animation runs after Stop Draw is pressed.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="roll-speed">Rolling speed (ms per tick)</Label>
              <Input
                id="roll-speed"
                type="number"
                min={20}
                step={10}
                value={settings?.rollSpeedMs ?? 60}
                onChange={(e) => updateSettings({ rollSpeedMs: Number(e.target.value) })}
              />
              <p className="text-muted-foreground text-xs">
                Lower is faster. Controls how quickly names cycle while rolling.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled" className="font-normal">Sound effects</Label>
              <Switch
                id="sound-enabled"
                checked={settings?.soundEnabled ?? true}
                onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="confetti-enabled" className="font-normal">Confetti</Label>
              <Switch
                id="confetti-enabled"
                checked={settings?.confettiEnabled ?? true}
                onCheckedChange={(checked) => updateSettings({ confettiEnabled: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="prizes" className="pt-2">
            <PrizeManager />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
