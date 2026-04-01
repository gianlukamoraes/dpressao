import { BloodPressureReading } from './index';

export type RootStackParamList = {
  Main: undefined;
  NewReading: { readingId?: string } | undefined;
  ReadingDetail: { reading: BloodPressureReading };
  PrivacyPolicy: undefined;
  About: undefined;
};

export type TabParamList = {
  Home: undefined;
  History: undefined;
  Trends: undefined;
  Settings: undefined;
};
