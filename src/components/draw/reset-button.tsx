"use client";

import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
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
};

export function ResetButton({ children, open: openProp, onOpenChange, ...buttonProps }: Props) {
  const { resetDraw } = useDraw();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

  return (
    <>
      <Button onClick={() => setOpen(true)} {...buttonProps}>
        {children}
      </Button>
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
