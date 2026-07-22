"use client";

import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDraw } from "@/context/draw-context";

type Props = Omit<ComponentProps<typeof Button>, "onClick"> & {
  /** Controlled confirm-dialog state, e.g. to open it from a keyboard shortcut. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Shown as a hover tooltip — use for icon-only invocations that have no visible label. */
  tooltip?: string;
};

export function ResetButton({ children, open: openProp, onOpenChange, tooltip, ...buttonProps }: Props) {
  const { resetDraw } = useDraw();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  const trigger = (
    <Button onClick={() => setOpen(true)} {...buttonProps}>
      {children}
    </Button>
  );

  return (
    <>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset the entire draw?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears all winners and marks every participant as eligible again. Prize
              counts are reset too. Participant data itself is kept. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setOpen(false);
                void resetDraw();
              }}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
