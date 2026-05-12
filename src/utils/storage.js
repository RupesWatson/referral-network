import AsyncStorage from '@react-native-async-storage/async-storage';

const DATA_KEY = '@referral_network_data';
const PASSWORD_KEY = '@referral_network_password';
const DEFAULT_PASSWORD = '1234';

export async function loadData() {
  try {
    const raw = await AsyncStorage.getItem(DATA_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('loadData error:', e);
    return null;
  }
}

export async function saveData(nodes, edges) {
  try {
    await AsyncStorage.setItem(DATA_KEY, JSON.stringify({ nodes, edges }));
  } catch (e) {
    console.error('saveData error:', e);
  }
}

export async function clearData() {
  try {
    await AsyncStorage.removeItem(DATA_KEY);
  } catch (e) {
    console.error('clearData error:', e);
  }
}

export async function getPassword() {
  try {
    const pw = await AsyncStorage.getItem(PASSWORD_KEY);
    return pw ?? DEFAULT_PASSWORD;
  } catch {
    return DEFAULT_PASSWORD;
  }
}

export async function setPassword(newPw) {
  try {
    await AsyncStorage.setItem(PASSWORD_KEY, newPw);
  } catch (e) {
    console.error('setPassword error:', e);
  }
}
