import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMarketingDemoStore } from './marketingDemoStore';

export const marketingDemoStore = createMarketingDemoStore({ storage: AsyncStorage, available: __DEV__ });
