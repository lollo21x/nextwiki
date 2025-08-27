/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { languageNameMap, LanguageCode, translations } from '../utils/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
  onSave: (settings: { accentColor: string; language: LanguageCode }) => void;
  language: LanguageCode;
  translations: typeof translations[LanguageCode];
}

const ACCENT_COLORS = ['default', 'blue', 'green', 'yellow', 'pink', 'orange', 'red', 'purple'];

const CheckmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="custom-select-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, accentColor, language, onSave, translations
}) => {
  const [selectedColor, setSelectedColor] = useState(accentColor);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(language);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedColor(accentColor);
      setSelectedLang(language);
    }
  }, [isOpen, accentColor, language]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isOpen && isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isDropdownOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLang(langCode as LanguageCode);
    setIsDropdownOpen(false);
  };

  const handleSave = () => {
    onSave({ accentColor: selectedColor, language: selectedLang });
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div>
          <h3 className="modal-section-title">Accent Color</h3>
          <div className="color-swatches">
            {ACCENT_COLORS.map(color => (
              <button
                key={color}
                id={`swatch-${color}`}
                className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
                onClick={() => setSelectedColor(color)}
                aria-label={`Set accent color to ${color}`}
              >
                {selectedColor === color && <CheckmarkIcon />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="modal-section-title">Language</h3>
          <div className={`custom-select-container ${isDropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
            <div className="custom-select-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <span>{languageNameMap[selectedLang]}</span>
              <ArrowDownIcon />
            </div>
            {isDropdownOpen && (
              <ul className="custom-select-options">
                {Object.entries(languageNameMap).map(([code, name]) => (
                  <li
                    key={code}
                    className={`custom-select-option ${selectedLang === code ? 'selected' : ''}`}
                    onClick={() => handleLanguageSelect(code)}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="save-button" onClick={handleSave}>
            {translations.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;