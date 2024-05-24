import '@tamagui/core/reset.css';
import '../fixes/fixMissingTextEncoder';

import { Stack } from 'expo-router';

import { AllAppProviders } from '../providers/AllAppProviders';

export default function HomeLayout() {
  return (
    <AllAppProviders>
      <Stack />
    </AllAppProviders>
  );
}
