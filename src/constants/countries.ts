export type Country = { code: string; name: string; dialCode: string };

/** Launch market first, then the region. Extend as Huntouse expands. */
export const COUNTRIES: Country[] = [
  { code: 'KE', name: 'Kenya', dialCode: '+254' },
  { code: 'UG', name: 'Uganda', dialCode: '+256' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251' },
  { code: 'SS', name: 'South Sudan', dialCode: '+211' },
  { code: 'SO', name: 'Somalia', dialCode: '+252' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];
