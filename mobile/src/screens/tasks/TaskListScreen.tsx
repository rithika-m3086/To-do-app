import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList, Task } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import { TaskItem } from '../../components/TaskItem';
import { PrimaryButton } from '../../components/PrimaryButton';
import { sortTasks } from '../../utils/sortTasks';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskList'>;

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { tasks, isLoading, error, fetchTasks, toggleComplete, deleteTask } = useTasks();
  const { isDark, colors, toggleTheme } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <View style={styles.userSection}>
          <Text style={[styles.title, { color: colors.text }]}>My Tasks</Text>
          {user?.email ? <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text> : null}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.themeToggleButton, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={toggleTheme}
          >
            <Text style={[styles.themeToggleText, { color: colors.text }]}>
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={logout}>
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
          <ActivityIndicator size="large" color={colors.primary} />
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
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No tasks found. Tap "+ Add New Task" to create one.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userSection: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 4,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 4,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#d32f2f',
    backgroundColor: '#fde8e8',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 4,
    textAlign: 'center',
  },
});
