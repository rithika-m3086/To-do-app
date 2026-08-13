import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList, CreateTaskPayload, UpdateTaskPayload } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { TaskForm } from '../../components/TaskForm';

type Props = NativeStackScreenProps<MainStackParamList, 'AddEditTask'>;

export const AddEditTaskScreen: React.FC<Props> = ({ route, navigation }) => {
  const existingTask = route.params?.task;
  const isEditing = !!existingTask;

  const { createTask, updateTask, error, clearTaskError } = useTasks();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (payload: CreateTaskPayload | UpdateTaskPayload) => {
    clearTaskError();
    setFormError(null);

    try {
      if (isEditing && existingTask) {
        await updateTask(existingTask._id, payload as UpdateTaskPayload);
      } else {
        await createTask(payload as CreateTaskPayload);
      }
      navigation.goBack();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed. Please try again.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isEditing ? 'Edit Task' : 'Create New Task'}</Text>
      </View>

      {formError || error ? (
        <Text style={styles.errorText}>{formError || error}</Text>
      ) : null}

      <TaskForm
        initialValues={existingTask}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditing={isEditing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  errorText: {
    fontSize: 13,
    color: '#d32f2f',
    backgroundColor: '#fde8e8',
    padding: 8,
    margin: 12,
    borderRadius: 4,
    textAlign: 'center',
  },
});
