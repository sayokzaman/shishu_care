import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { sendRequest, setAuthToken } from './api';

const TOKEN_KEY = 'shishucare_token';
const USER_KEY = 'shishucare_user';

type User = {
  id: string;
  fullNameBn: string;
  fullNameEn: string | null;
  phone: string;
  role: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
};

type RegisterInput = {
  phone: string;
  fullNameBn: string;
  fullNameEn?: string;
  password: string;
  role: 'parent' | 'health_worker';
  upazillaId: number;
  districtId: number;
  divisionId: number;
  dateOfBirth?: Date;
};

type AuthContextType = AuthState & {
  login: (phone: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const [token, userJson] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
        const tokenValue = token[1];
        const userValue = userJson[1];
        if (tokenValue && userValue) {
          const user: User = JSON.parse(userValue);
          setAuthToken(tokenValue);
          setAuth({ token: tokenValue, user });
        }
      } catch {
        // corrupted storage — start unauthenticated
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (phone: string, password: string) => {
    const data = await sendRequest('/api/auth/login', 'POST', { phone, password } as any);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, data.token],
      [USER_KEY, JSON.stringify(data.user)],
    ]);
    setAuthToken(data.token);
    setAuth({ token: data.token, user: data.user });
  };

  const register = async (input: RegisterInput) => {
    const body = {
      ...input,
      dateOfBirth: input.dateOfBirth ? input.dateOfBirth.toISOString() : undefined,
    };
    const data = await sendRequest('/api/auth/register', 'POST', body as any);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, data.token],
      [USER_KEY, JSON.stringify(data.user)],
    ]);
    setAuthToken(data.token);
    setAuth({ token: data.token, user: data.user });
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setAuthToken(null);
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout, isAuthenticated: !!auth.token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
