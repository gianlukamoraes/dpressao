import { BloodPressureReading } from './index';

export type RootStackParamList = {
  Main: undefined;
  NewReading: { readingId?: string } | undefined;
  ReadingDetail: { reading: BloodPressureReading };
  Profile: undefined;
  PrivacyPolicy: undefined;
  About: undefined;
  Disclaimer: undefined;
};

export type TabParamList = {
  Home: undefined;
  History: undefined;
  Trends: undefined;
  Settings: undefined;
};
