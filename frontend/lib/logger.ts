const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDev) console.log(`🔍 ${message}`, ...args);
  },
  info: (message: string, ...args: any[]) => {
    if (isDev) console.log(`ℹ️ ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    if (isDev) console.error(`❌ ${message}`, ...args);
  },
  success: (message: string, ...args: any[]) => {
    if (isDev) console.log(`✅ ${message}`, ...args);
  }
};
