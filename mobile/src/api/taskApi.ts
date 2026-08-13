import client from './client';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '../types';

export const getTasksApi = async (): Promise<Task[]> => {
  const response = await client.get<Task[]>('/tasks');
  return response.data;
};

export const createTaskApi = async (payload: CreateTaskPayload): Promise<Task> => {
  const response = await client.post<Task>('/tasks', payload);
  return response.data;
};

export const updateTaskApi = async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
  const response = await client.put<Task>(`/tasks/${id}`, payload);
  return response.data;
};

export const deleteTaskApi = async (id: string): Promise<{ success: boolean }> => {
  const response = await client.delete<{ success: boolean }>(`/tasks/${id}`);
  return response.data;
};
