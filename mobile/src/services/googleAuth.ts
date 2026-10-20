import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import { apiClient } from '../api/client';

export interface GoogleAuthResult {
  idToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    photo?: string;
  };
}

let cachedClientId: string | null = null;
let isConfigured = false;

/**
 * Fetch OAuth Web Client ID dynamically from backend ENV configuration.
 * Avoids hardcoding any secrets or credentials inside the mobile codebase.
 */
export async function getGoogleClientId(): Promise<string> {
  if (cachedClientId) {
    return cachedClientId;
  }
  try {
    const res = await apiClient.get('/auth/google/config');
    if (res.data?.clientId) {
      cachedClientId = res.data.clientId;
      return cachedClientId;
    }
  } catch (err: any) {
    console.warn('[GoogleAuth] Could not fetch Google client ID from server:', err.message);
  }
  return '';
}

export async function initGoogleAuth(customClientId?: string): Promise<void> {
  const webClientId = customClientId || (await getGoogleClientId());
  if (!webClientId) {
    throw new Error('Chưa cấu hình Google Client ID trên hệ thống.');
  }

  if (!isConfigured) {
    GoogleSignin.configure({
      webClientId,
      offlineAccess: false,
    });
    isConfigured = true;
  }
}

export async function promptGoogleSignIn(customWebClientId?: string): Promise<GoogleAuthResult> {
  await initGoogleAuth(customWebClientId);

  // Clear previous session so Google Play Services always displays the Account Chooser dialog
  try {
    await GoogleSignin.signOut();
  } catch (_) {
    // Ignore if no session was active
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    // v16 returns { type: 'success', data: User } or { type: 'cancelled' }
    if (response && (response as any).type === 'cancelled') {
      throw new Error('Đăng nhập Google đã bị hủy.');
    }

    const userData = (response as any).data || response;
    const user = userData?.user;
    const idToken = userData?.idToken;

    if (!user && !idToken) {
      throw new Error('Không nhận được thông tin tài khoản từ Google.');
    }

    return {
      idToken,
      user: {
        id: user?.id || `google_${Date.now()}`,
        email: user?.email || '',
        name: user?.name || user?.givenName || 'Người dùng Google',
        photo: user?.photo || undefined,
      },
    };
  } catch (err: any) {
    if (isErrorWithCode(err)) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Đăng nhập Google đã bị hủy.');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        throw new Error('Tiến trình đăng nhập Google đang chạy.');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services không khả dụng.');
      }
    }
    console.warn('[GoogleAuth] Sign-in error:', err);
    throw new Error(err.message || 'Lỗi đăng nhập qua Google');
  }
}
