import React, { createContext, useReducer, useContext, ReactNode, useCallback } from 'react';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '../types';
import { getTasksApi, createTaskApi, updateTaskApi, deleteTaskApi } from '../api/taskApi';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface TaskContextType extends TaskState {
  fetchTasks: () => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (task: Task) => Promise<void>;
  clearTaskError: () => void;
}

const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
};

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        isLoading: false,
        error: null,
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        isLoading: false,
        error: null,
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t._id === action.payload._id ? action.payload : t)),
        isLoading: false,
        error: null,
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t._id !== action.payload),
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchTasks = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await getTasksApi();
      dispatch({ type: 'SET_TASKS', payload: data });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch tasks';
      dispatch({ type: 'SET_ERROR', payload: msg });
    }
  }, []);

  const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newTask = await createTaskApi(payload);
      dispatch({ type: 'ADD_TASK', payload: newTask });
      return newTask;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create task';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const updateTask = async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updated = await updateTaskApi(id, payload);
      dispatch({ type: 'UPDATE_TASK', payload: updated });
      return updated;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update task';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await deleteTaskApi(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete task';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const toggleComplete = async (task: Task): Promise<void> => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(task._id, { status: newStatus });
  };

  const clearTaskError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  return (
    <TaskContext.Provider
      value={{
        ...state,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        toggleComplete,
        clearTaskError,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
