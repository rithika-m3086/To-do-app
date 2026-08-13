import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList, CreateTaskPayload, UpdateTaskPayload } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import { TaskForm } from '../../components/TaskForm';

type Props = NativeStackScreenProps<MainStackParamList, 'AddEditTask'>;

export const AddEditTaskScreen: React.FC<Props> = ({ route, navigation }) => {
  const existingTask = route.params?.task;
  const isEditing = !!existingTask;

  const { createTask, updateTask, error, clearTaskError } = useTasks();
  const { colors } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{isEditing ? 'Edit Task' : 'Create New Task'}</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
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
