import { useEffect, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { cn } from '../../../components/ui/utils';

interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  reasonRequired?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonMinLength?: number;
  reasonValue?: string;
  onReasonChange?: (value: string) => void;
  onConfirm: (reason?: string) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar ação',
  cancelLabel = 'Cancelar',
  destructive = false,
  loading = false,
  reasonRequired = false,
  reasonLabel = 'Motivo',
  reasonPlaceholder = 'Descreva o motivo para a auditoria',
  reasonMinLength = 3,
  reasonValue,
  onReasonChange,
  onConfirm,
  onOpenChange,
}: ConfirmActionDialogProps) {
  const [internalReason, setInternalReason] = useState('');
  const currentReason = reasonValue ?? internalReason;
  const trimmedReason = currentReason.trim();
  const reasonInvalid = reasonRequired && trimmedReason.length < reasonMinLength;

  useEffect(() => {
    if (!open && reasonValue === undefined) {
      setInternalReason('');
    }
  }, [open, reasonValue]);

  function updateReason(nextReason: string) {
    if (onReasonChange) {
      onReasonChange(nextReason);
    } else {
      setInternalReason(nextReason);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-slate-200 bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {reasonRequired && (
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            <span>{reasonLabel}</span>
            <textarea
              value={currentReason}
              onChange={(event) => updateReason(event.target.value)}
              placeholder={reasonPlaceholder}
              className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
            />
          </label>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            className={cn(destructive && 'bg-red-600 hover:bg-red-700 focus:ring-red-400')}
            disabled={loading || reasonInvalid}
            onClick={(event) => {
              event.preventDefault();
              if (reasonInvalid) return;
              void onConfirm(trimmedReason || undefined);
            }}
          >
            {loading ? 'Processando...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
