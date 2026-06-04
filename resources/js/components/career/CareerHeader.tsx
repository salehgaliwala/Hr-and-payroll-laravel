import { useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { getImagePath } from '@/utils/helpers';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/language-switcher';

interface CareerHeaderProps {
  title?: string;
  showBackToHome?: boolean;
  logoOnly?: boolean;
  companySettings?: any;
}

export default function CareerHeader({ title, showBackToHome, logoOnly = false, companySettings }: CareerHeaderProps) {
  const { t, i18n } = useTranslation();
  const { userLanguage } = usePage().props as any;
  const activeLanguage = companySettings?.defaultLanguage || userLanguage || 'en';

  useEffect(() => {
    if (activeLanguage && i18n.language !== activeLanguage) {
      i18n.changeLanguage(activeLanguage);
    }
  }, [activeLanguage, i18n]);

  useEffect(() => {
    const isRtl = ['ar', 'he'].includes(activeLanguage) || companySettings?.layoutDirection === 'right';
    const dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.setAttribute('dir', dir);
    document.body.dir = dir;

    return () => {
      // Reset to LTR when leaving career page
      document.documentElement.dir = 'ltr';
      document.documentElement.setAttribute('dir', 'ltr');
      document.body.dir = 'ltr';
    };
  }, [activeLanguage, companySettings?.layoutDirection]);
  
  // Get theme color from company settings
  const getThemeColor = () => {
    const themeColor = companySettings?.themeColor || 'blue';
    const customColor = companySettings?.customColor || '#3b82f6';
    
    if (themeColor === 'custom') {
      return customColor;
    }
    
    const colorMap = {
      blue: '#2563eb',
      green: '#059669',
      purple: '#7c3aed',
      orange: '#ea580c',
      red: '#dc2626'
    };
    
    return colorMap[themeColor as keyof typeof colorMap] || colorMap.blue;
  };

  const themeColor = getThemeColor();
  
  const getCompanyLogo = () => {
    if (companySettings?.logoDark) {
      return getImagePath(companySettings.logoDark);
    }
    return "https://via.placeholder.com/120x32/3B82F6/FFFFFF?text=LOGO";
  };

  const getCompanyName = () => {
    return companySettings?.titleText || "Company";
  };

  if (logoOnly) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-16">
            <div className="flex-1 flex justify-start sm:justify-center">
              <img
                className="h-6 sm:h-8 w-auto"
                src={getCompanyLogo()}
                alt={`${getCompanyName()} Logo`}
              />
            </div>
            <div className="flex-shrink-0">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-6 sm:h-8 w-auto"
                src={getCompanyLogo()}
                alt={`${getCompanyName()} Logo`}
              />
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden sm:flex space-x-4 lg:space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm lg:text-base">{t("Home")}</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm lg:text-base">{t("About")}</Link>
              <Link href="/career" className="text-primary font-medium text-sm lg:text-base">{t("Careers")}</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm lg:text-base">{t("Contact")}</Link>
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}