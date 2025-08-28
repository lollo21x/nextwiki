/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { languageNameMap, LanguageCode, translations } from '../utils/translations';
import { GenerationMode } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
  onSave: (settings: { accentColor: string; language: LanguageCode; generationMode: GenerationMode; }) => void;
  language: LanguageCode;
  generationMode: GenerationMode;
  translations: typeof translations[LanguageCode];
}

const ACCENT_COLORS = ['default', 'blue', 'green', 'yellow', 'pink', 'orange', 'red', 'purple'];
const MODES: GenerationMode[] = ['encyclopedia', 'eli5', 'practicalExamples', 'stepByStep', 'summary', 'funFacts'];

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
  isOpen, onClose, accentColor, language, generationMode, onSave, translations
}) => {
  const [selectedColor, setSelectedColor] = useState(accentColor);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(language);
  const [selectedMode, setSelectedMode] = useState<GenerationMode>(generationMode);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedColor(accentColor);
      setSelectedLang(language);
      setSelectedMode(generationMode);
    }
  }, [isOpen, accentColor, language, generationMode]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
        setIsModeDropdownOpen(false);
      }
    };
    if (isOpen && isModeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isModeDropdownOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLang(langCode as LanguageCode);
    setIsLangDropdownOpen(false);
  };

  const handleModeSelect = (mode: GenerationMode) => {
    setSelectedMode(mode);
    setIsModeDropdownOpen(false);
  };

  const handleSave = () => {
    onSave({ accentColor: selectedColor, language: selectedLang, generationMode: selectedMode });
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
          <h3 className="modal-section-title">{translations.generationMode}</h3>
          <div className={`custom-select-container ${isModeDropdownOpen ? 'open' : ''}`} ref={modeDropdownRef}>
            <div className="custom-select-trigger" onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}>
              <span>{translations.modes[selectedMode]}</span>
              <ArrowDownIcon />
            </div>
            {isModeDropdownOpen && (
              <ul className="custom-select-options">
                {MODES.map(mode => (
                  <li
                    key={mode}
                    className={`custom-select-option ${selectedMode === mode ? 'selected' : ''}`}
                    onClick={() => handleModeSelect(mode)}
                  >
                    {translations.modes[mode]}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <h3 className="modal-section-title">Language</h3>
          <div className={`custom-select-container ${isLangDropdownOpen ? 'open' : ''}`} ref={langDropdownRef}>
            <div className="custom-select-trigger" onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}>
              <span>{languageNameMap[selectedLang]}</span>
              <ArrowDownIcon />
            </div>
            {isLangDropdownOpen && (
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