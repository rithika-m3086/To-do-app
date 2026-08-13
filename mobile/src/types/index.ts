export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface SubTask {
  _id?: string;
  title: string;
  completed: boolean;
}

export interface User {
  id: string;
  email: string;
}

export interface Task {
  _id: string;
  owner: string;
  title: string;
  description?: string;
  category?: string;
  dateTime: string; // ISO String
  deadline?: string; // ISO String
  priority: Priority;
  status: TaskStatus;
  subTasks?: SubTask[];
  createdAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  category?: string;
  dateTime?: string;
  deadline?: string;
  priority?: Priority;
  subTasks?: SubTask[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  category?: string;
  dateTime?: string;
  deadline?: string;
  priority?: Priority;
  status?: TaskStatus;
  subTasks?: SubTask[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  TaskList: undefined;
  AddEditTask: { task?: Task } | undefined;
};
