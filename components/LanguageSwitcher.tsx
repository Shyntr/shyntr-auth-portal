'use client';

import { useTransition } from 'react';
import { setLocale } from '@/actions/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLocale: string;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    startTransition(async () => {
      await setLocale(value);
      // Reload the page to apply new locale
      window.location.reload();
    });
  };

  return (
    <Select value={currentLocale} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-[130px] bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white transition-colors">
        <Globe className="h-4 w-4 mr-2 text-gray-500" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
