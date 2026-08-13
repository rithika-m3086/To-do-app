import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList, Task } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import { TaskItem } from '../../components/TaskItem';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PomodoroTimerModal } from '../../components/PomodoroTimerModal';
import { sortTasks } from '../../utils/sortTasks';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskList'>;

type FilterOption = 'All' | 'Today' | 'Pending' | 'High Priority' | 'Completed';

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { tasks, isLoading, error, fetchTasks, toggleComplete, deleteTask } = useTasks();
  const { isDark, colors, toggleTheme } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [showPomodoroModal, setShowPomodoroModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  // Filter tasks based on selected filter and category
  const filteredTasks = tasks.filter((t) => {
    // Status / Smart filter
    if (activeFilter === 'Pending' && t.status !== 'pending') return false;
    if (activeFilter === 'Completed' && t.status !== 'completed') return false;
    if (activeFilter === 'High Priority' && t.priority !== 'high') return false;
    if (activeFilter === 'Today') {
      const todayStr = new Date().toDateString();
      const taskDateStr = t.deadline ? new Date(t.deadline).toDateString() : new Date(t.dateTime).toDateString();
      if (todayStr !== taskDateStr) return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && t.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  const sortedTaskList = sortTasks(filteredTasks);

  // Extract unique categories from tasks
  const availableCategories = ['All'].concat(
    Array.from(new Set(tasks.map((t) => t.category).filter(Boolean) as string[]))
  );

  const handleEditTask = (task: Task) => {
    navigation.navigate('AddEditTask', { task });
  };

  const handleAddTask = () => {
    navigation.navigate('AddEditTask');
  };

  const handleStartFocus = (task: Task) => {
    setFocusTask(task);
    setShowPomodoroModal(true);
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

      {/* Smart Filters Scroll Row */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {(['All', 'Today', 'Pending', 'High Priority', 'Completed'] as FilterOption[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                { borderColor: colors.border, backgroundColor: colors.card },
                activeFilter === filter && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: colors.text },
                  activeFilter === filter && { color: '#ffffff', fontWeight: 'bold' },
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Pills */}
        {availableCategories.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {availableCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catPill,
                  { borderColor: colors.border, backgroundColor: colors.headerBackground },
                  selectedCategory === cat && { backgroundColor: '#10b981', borderColor: '#10b981' },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.catText,
                    { color: colors.text },
                    selectedCategory === cat && { color: '#ffffff', fontWeight: 'bold' },
                  ]}
                >
                  📁 {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}
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
              onStartFocus={handleStartFocus}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No tasks match your filters. Tap "+ Add New Task" to create one.
              </Text>
            </View>
          }
        />
      )}

      {/* Pomodoro Timer Modal */}
      <PomodoroTimerModal
        visible={showPomodoroModal}
        task={focusTask}
        onClose={() => {
          setShowPomodoroModal(false);
          setFocusTask(null);
        }}
      />
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
  filterSection: {
    paddingVertical: 6,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
  },
  filterText: {
    fontSize: 12,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 12,
  },
  catText: {
    fontSize: 11,
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
