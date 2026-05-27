import { ConfirmActionDialog } from './ConfirmActionDialog';

interface AdminConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function AdminConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar ação',
  cancelLabel = 'Cancelar',
  destructive = false,
  loading = false,
  onConfirm,
  onOpenChange,
}: AdminConfirmationDialogProps) {
  return (
    <ConfirmActionDialog
      open={open}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      destructive={destructive}
      loading={loading}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  );
}
