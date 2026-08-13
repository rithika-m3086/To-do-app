import React, { createContext, useReducer, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { loginApi, registerApi } from '../api/authApi';
import { setAuthToken } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'RESTORE_TOKEN'; token: string | null; user: User | null }
  | { type: 'LOGIN_SUCCESS'; token: string; user: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        token: action.token,
        user: action.user,
        isLoading: false,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        token: action.token,
        user: action.user,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        token: null,
        user: null,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('user_token');
        const storedUserJson = await AsyncStorage.getItem('user_data');
        const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;

        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          dispatch({ type: 'RESTORE_TOKEN', token: storedToken, user: storedUser });
        } else {
          dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
        }
      } catch (e) {
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const data = await loginApi(email, password);
      await AsyncStorage.setItem('user_token', data.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
      setAuthToken(data.token);
      dispatch({ type: 'LOGIN_SUCCESS', token: data.token, user: data.user });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Login failed. Please check credentials.';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw new Error(message);
    }
  };

  const register = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const data = await registerApi(email, password);
      await AsyncStorage.setItem('user_token', data.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
      setAuthToken(data.token);
      dispatch({ type: 'LOGIN_SUCCESS', token: data.token, user: data.user });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user_token');
      await AsyncStorage.removeItem('user_data');
      setAuthToken(null);
      dispatch({ type: 'LOGOUT' });
    } catch (e) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
