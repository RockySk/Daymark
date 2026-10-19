import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sourabhkulkarni.daymark',
  appName: 'Daymark',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "countdateapp-logo",
      iconColor: "#6750A4"
    },
    SplashScreen: {
      backgroundColor: "#6750A4",
    }
  },
};

export default config;
