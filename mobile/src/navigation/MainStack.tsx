import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { AddEditTaskScreen } from '../screens/tasks/AddEditTaskScreen';
import { TaskProvider } from '../context/TaskContext';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack = () => {
  return (
    <TaskProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="TaskList" component={TaskListScreen} />
        <Stack.Screen name="AddEditTask" component={AddEditTaskScreen} />
      </Stack.Navigator>
    </TaskProvider>
  );
};
