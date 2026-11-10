import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orizzoncart.marketplace',
  appName: 'OrizzonCart Marketplace',
  webDir: 'public',
  server: {
    url: 'https://orizzoncart.com.ng/marketplace',
    cleartext: false
  }
};

export default config;
