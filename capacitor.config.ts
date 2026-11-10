import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orizzoncart.marketplace',
  appName: 'OrizzonCart Marketplace',
  webDir: 'public',
  server: {
    url: 'https://marketplace.orizzoncart.com.ng',
    cleartext: false
  }
};

export default config;
