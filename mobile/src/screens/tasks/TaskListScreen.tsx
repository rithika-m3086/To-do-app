import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList, Task } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { TaskItem } from '../../components/TaskItem';
import { PrimaryButton } from '../../components/PrimaryButton';
import { sortTasks } from '../../utils/sortTasks';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskList'>;

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { tasks, isLoading, error, fetchTasks, toggleComplete, deleteTask } = useTasks();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const sortedTaskList = sortTasks(tasks);

  const handleEditTask = (task: Task) => {
    navigation.navigate('AddEditTask', { task });
  };

  const handleAddTask = () => {
    navigation.navigate('AddEditTask');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userSection}>
          <Text style={styles.title}>My Tasks</Text>
          {user?.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.topBar}>
        <PrimaryButton title="+ Add New Task" onPress={handleAddTask} />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isLoading && tasks.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      ) : (
        <FlatList
          data={sortedTaskList}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggleComplete={toggleComplete}
              onEdit={handleEditTask}
              onDelete={deleteTask}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No tasks found. Tap "+ Add New Task" to create one.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  userSection: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  userEmail: {
    fontSize: 12,
    color: '#666666',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  listContent: {
    padding: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#d32f2f',
    backgroundColor: '#fde8e8',
    padding: 8,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 4,
    textAlign: 'center',
  },
});
