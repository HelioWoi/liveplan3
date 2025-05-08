import { useState } from 'react';
import SpreadsheetUploader from '../spreadsheet/SpreadsheetUploader';

interface SpreadsheetUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SpreadsheetUploadModal({ open, onClose }: SpreadsheetUploadModalProps) {
  if (!open) return null;
  return <SpreadsheetUploader onClose={onClose} />;
}
