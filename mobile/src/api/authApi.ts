import client from './client';
import { AuthResponse } from '../types';

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/auth/register', { email, password });
  return response.data;
};
