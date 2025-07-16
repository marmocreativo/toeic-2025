import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Button } from '../ui/button';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <div className="flex border rounded-md overflow-hidden">
        <Button
          variant={language === 'es' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => changeLanguage('es')}
          className="rounded-none"
        >
          ES
        </Button>
        <Button
          variant={language === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => changeLanguage('en')}
          className="rounded-none"
        >
          EN
        </Button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;