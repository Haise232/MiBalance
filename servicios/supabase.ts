import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Expo inlines EXPO_PUBLIC_* variables at build time. They must be accessed
// with the full `process.env.EXPO_PUBLIC_...` expression (no destructuring).
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[supabase] Faltan EXPO_PUBLIC_SUPABASE_URL y/o EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copia .env.example a .env, rellena los valores y reinicia Metro (npx expo start -c). ' +
      'Para builds de EAS, defínelas como variables de entorno del proyecto.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // On web the confirmation / recovery links land on the site URL with the
    // tokens in the hash; let supabase-js pick them up. Native handles the
    // deep link manually in contextos/SesionContexto.tsx.
    detectSessionInUrl: Platform.OS === 'web',
  },
  realtime: {
    transport: typeof WebSocket !== 'undefined' ? WebSocket : undefined,
  },
});
