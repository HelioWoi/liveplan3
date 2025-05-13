// Componente de modal para upload de planilha
import SpreadsheetUploader from '../spreadsheet/SpreadsheetUploader';

interface SpreadsheetUploadModalProps {
  open: boolean;
  onClose: (uploadCompleted?: boolean) => void;
}

export default function SpreadsheetUploadModal({ open, onClose }: SpreadsheetUploadModalProps) {
  if (!open) return null;
  return <SpreadsheetUploader onClose={onClose} />;
}
