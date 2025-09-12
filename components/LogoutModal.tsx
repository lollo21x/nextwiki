/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  translations: { [key: string]: string };
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm, translations }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          {translations.logoutConfirm || 'Sei sicuro di voler effettuare il logout?'}
        </p>
        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            className="cancel-button"
            onClick={onClose}
            style={{ flex: 1, padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '32px' }}
          >
            {translations.no || 'No'}
          </button>
          <button
            className="save-button"
            onClick={onConfirm}
            style={{ flex: 1, padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '32px' }}
          >
            {translations.yes || 'Sì'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;