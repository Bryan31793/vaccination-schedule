import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'medico_token';
const USER_KEY  = 'medico_user';

// expo-secure-store no funciona en web — usamos localStorage como fallback
const isWeb = Platform.OS === 'web';

async function set(key: string, value: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function get(key: string): Promise<string | null> {
  if (isWeb) {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function remove(key: string): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export const storage = {
  saveToken:  (token: string) => set(TOKEN_KEY, token),
  getToken:   ()              => get(TOKEN_KEY),
  removeToken:()              => remove(TOKEN_KEY),

  saveUser:   (user: object)  => set(USER_KEY, JSON.stringify(user)),
  getUser:    async ()        => {
    const raw = await get(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  removeUser: ()              => remove(USER_KEY),

  clear: async () => {
    await remove(TOKEN_KEY);
    await remove(USER_KEY);
  },
};
