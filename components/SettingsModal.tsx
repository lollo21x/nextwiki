/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { languageNameMap, LanguageCode, translations } from '../utils/translations';
import { GenerationMode } from '../services/geminiService';
import { Settings, X, Check, ChevronDown } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
  onSave: (settings: { 
    accentColor: string; 
    language: LanguageCode; 
    generationMode: GenerationMode; 
  }) => void;
  language: LanguageCode;
  generationMode: GenerationMode;
  translations: typeof translations[LanguageCode];
}

const ACCENT_COLORS = [
  { id: 'default', label: 'Default', value: 'default' },
  { id: 'blue', label: 'Blue', value: 'blue' },
  { id: 'green', label: 'Green', value: 'green' },
  { id: 'yellow', label: 'Yellow', value: 'yellow' },
  { id: 'pink', label: 'Pink', value: 'pink' },
  { id: 'orange', label: 'Orange', value: 'orange' },
  { id: 'red', label: 'Red', value: 'red' },
  { id: 'purple', label: 'Purple', value: 'purple' },
];

const CheckmarkIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowDownIcon: React.FC = () => (
  <svg className="custom-select-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Language selector dropdown component
 */
const LanguageSelector: React.FC<{
  selectedLang: LanguageCode;
  setSelectedLang: (lang: LanguageCode) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}> = ({ selectedLang, setSelectedLang, isOpen, setIsOpen, dropdownRef }) => {
  return (
    <div className={`custom-select-container ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{languageNameMap[selectedLang]}</span>
        <ChevronDown size={16} className="custom-select-arrow" />
      </button>
      {isOpen && (
        <ul className="custom-select-options" role="listbox">
          {Object.entries(languageNameMap).map(([code, name]) => (
            <li
              key={code}
              className={`custom-select-option ${selectedLang === code ? 'selected' : ''}`}
              onClick={() => {
                setSelectedLang(code as LanguageCode);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={selectedLang === code}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedLang(code as LanguageCode);
                  setIsOpen(false);
                }
              }}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Accent color swatch component
 */
const ColorSwatch: React.FC<{
  color: string;
  selectedColor: string;
  onClick: (color: string) => void;
  label: string;
}> = ({ color, selectedColor, onClick, label }) => (
  <button
    type="button"
    id={`swatch-${color}`}
    className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
    onClick={() => onClick(color)}
    aria-label={`Set accent color to ${label}`}
    style={{ background: `var(--accent-${color})` }}
  >
    {selectedColor === color && <CheckmarkIcon />}
  </button>
);

/**
 * Main SettingsModal component
 */
const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, 
  onClose, 
  accentColor, 
  language, 
  generationMode, 
  onSave, 
  translations
}) => {
  const [selectedColor, setSelectedColor] = useState(accentColor);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(language);
  const [selectedGenerationMode, setSelectedGenerationMode] = useState<GenerationMode>(generationMode);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize with current values when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedColor(accentColor);
      setSelectedLang(language);
      setSelectedGenerationMode(generationMode);
    }
  }, [isOpen, accentColor, language, generationMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    if (isOpen && isLangDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isLangDropdownOpen]);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = () => {
    onSave({ 
      accentColor: selectedColor, 
      language: selectedLang, 
      generationMode: selectedGenerationMode 
    });
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div 
        className="modal-content modal-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 id="settings-modal-title" className="modal-title">
            <Settings size={20} />
            {translations.accentColor}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Accent Color Section */}
          <div className="mb-lg">
            <h3 className="modal-section-title">{translations.accentColor}</h3>
            <div className="color-swatches">
              {ACCENT_COLORS.map((color) => (
                <ColorSwatch
                  key={color.id}
                  color={color.value}
                  selectedColor={selectedColor}
                  onClick={setSelectedColor}
                  label={color.label}
                />
              ))}
            </div>
          </div>

          {/* Language Section */}
          <div className="mb-lg">
            <h3 className="modal-section-title">{translations.language}</h3>
            <LanguageSelector
              selectedLang={selectedLang}
              setSelectedLang={setSelectedLang}
              isOpen={isLangDropdownOpen}
              setIsOpen={setIsLangDropdownOpen}
              dropdownRef={langDropdownRef}
            />
          </div>

          {/* Generation Mode Section */}
          <div className="mb-lg">
            <h3 className="modal-section-title">Generation Mode</h3>
            <div className="custom-select-container">
              <button
                type="button"
                className="custom-select-trigger"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                aria-label="Select generation mode"
              >
                <span>{selectedGenerationMode}</span>
                <ChevronDown size={16} className="custom-select-arrow" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            {translations.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
