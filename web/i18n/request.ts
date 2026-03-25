import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Import all message files statically
import enMessages from '../messages/en.json';
import esMessages from '../messages/es.json';
import ukMessages from '../messages/uk.json';
import ruMessages from '../messages/ru.json';

const messages = {
  en: enMessages,
  es: esMessages,
  uk: ukMessages,
  ru: ruMessages,
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: messages[locale as keyof typeof messages],
  };
});
