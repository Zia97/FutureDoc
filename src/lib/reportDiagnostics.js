import { Dimensions, Platform, PixelRatio } from 'react-native';
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCached } from '../services/contentCache';

const SECTIONS = { dm: 'decision_making', qr: 'quantitative_reasoning', sj: 'situational_judgement', vr: 'verbal_reasoning' };
export const REPORT_APP_VERSION = Constants.expoConfig?.version ?? Constants.manifest?.version ?? null;

export async function collectReportDiagnostics(section, isTimed, context = {}) {
  const viewport = Dimensions.get('window');
  const diagnostics = {
    os_version: String(Platform.Version),
    device_model: Platform.constants?.Model ?? Constants.platform?.ios?.model ?? null,
    build_number: String(Constants.platform?.ios?.buildNumber ?? Constants.platform?.android?.versionCode ??
      (Platform.OS === 'ios' ? Constants.expoConfig?.ios?.buildNumber : Constants.expoConfig?.android?.versionCode) ?? ''),
    viewport_width: viewport.width,
    viewport_height: viewport.height,
    system_font_scale: PixelRatio.getFontScale(),
    mode: isTimed ? 'timed' : 'practice',
  };
  // Accept only known screen state, never arbitrary route params or user objects.
  for (const key of ['selected_answer', 'question_index', 'seconds_left', 'is_paused', 'submitted', 'screen']) {
    const value = context[key];
    if (value != null && (['string', 'number', 'boolean'].includes(typeof value) || key === 'selected_answer')) {
      diagnostics[key] = value;
    }
  }
  let timeout;
  try {
    await Promise.race([
      Promise.allSettled([
        getCached(`${isTimed ? 'timed_' : ''}${SECTIONS[section]}`).then((cached) => { diagnostics.cached_content_version = cached?.version ?? null; }),
        AsyncStorage.getItem('text_size_preference').then((size) => { diagnostics.text_size = size ?? 'default'; }),
        NetInfo.fetch().then((network) => {
          diagnostics.network_type = network.type;
          diagnostics.is_connected = network.isConnected;
          diagnostics.internet_reachable = network.isInternetReachable;
        }),
      ]),
      new Promise((resolve) => { timeout = setTimeout(resolve, 1500); }),
    ]);
  } finally { clearTimeout(timeout); }
  return { ...diagnostics };
}
