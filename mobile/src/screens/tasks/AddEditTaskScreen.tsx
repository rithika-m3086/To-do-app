import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList, CreateTaskPayload, UpdateTaskPayload } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import { TaskForm } from '../../components/TaskForm';
import { AppBackground } from '../../components/AppBackground';

type Props = NativeStackScreenProps<MainStackParamList, 'AddEditTask'>;

export const AddEditTaskScreen: React.FC<Props> = ({ route, navigation }) => {
  const existingTask = route.params?.task;
  const isEditing = !!existingTask;

  const { createTask, updateTask, error, clearTaskError } = useTasks();
  const { colors, isDark } = useTheme();
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
    <AppBackground>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { backgroundColor: isDark ? colors.headerBackground : 'rgba(255, 255, 255, 0.85)', borderBottomColor: isDark ? colors.border : 'rgba(255, 255, 255, 0.6)' }]}>
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
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    padding: 10,
    margin: 16,
    borderRadius: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
