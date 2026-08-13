import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList, Task } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import { TaskItem } from '../../components/TaskItem';
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
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Stat counts for dashboard summary cards
  const totalCount = tasks.length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const todayCount = tasks.filter((t) => {
    const todayStr = new Date().toDateString();
    const taskDateStr = t.deadline ? new Date(t.deadline).toDateString() : new Date(t.dateTime).toDateString();
    return todayStr === taskDateStr;
  }).length;

  const getFilterCount = (filter: FilterOption) => {
    switch (filter) {
      case 'All': return totalCount;
      case 'Today': return todayCount;
      case 'Pending': return pendingCount;
      case 'High Priority': return highPriorityCount;
      case 'Completed': return completedCount;
    }
  };

  // Filter & Search tasks
  const filteredTasks = tasks.filter((t) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

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

  const getUserName = () => {
    if (!user?.email) return 'Friend';
    return user.email.split('@')[0];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Redesigned Dashboard Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <View style={styles.profileRow}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{getUserName().charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.greetingGroup}>
            <Text style={[styles.greetingText, { color: colors.textSecondary }]}>Good morning 👋</Text>
            <Text style={[styles.userNameText, { color: colors.text }]}>{getUserName()}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionBadge, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={toggleTheme}
          >
            <Text style={[styles.actionBadgeText, { color: colors.text }]}>
              {isDark ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBadge, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={logout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

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
        ListHeaderComponent={
          <View style={styles.dashboardTop}>
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search tasks..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={[styles.clearSearch, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Summary Stat Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
              <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#eff6ff', borderColor: colors.border }]}>
                <Text style={styles.statIcon}>📋</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{totalCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Tasks</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: isDark ? '#3b0764' : '#fef2f2', borderColor: colors.border }]}>
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>{highPriorityCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>High Priorities</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: isDark ? '#064e3b' : '#f0fdf4', borderColor: colors.border }]}>
                <Text style={styles.statIcon}>✅</Text>
                <Text style={[styles.statValue, { color: '#16a34a' }]}>{completedCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
              </View>
            </ScrollView>

            {/* Status Filter Pills */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Filters</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
              {(['All', 'Today', 'Pending', 'High Priority', 'Completed'] as FilterOption[]).map((filter) => {
                const count = getFilterCount(filter);
                const isActive = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterPill,
                      { borderColor: colors.border, backgroundColor: colors.card },
                      isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: colors.text },
                        isActive && { color: '#ffffff', fontWeight: 'bold' },
                      ]}
                    >
                      {filter} {count > 0 ? `(${count})` : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Category Pills */}
            {availableCategories.length > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
                {availableCategories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catPill,
                        { borderColor: colors.border, backgroundColor: colors.headerBackground },
                        isActive && { backgroundColor: '#10b981', borderColor: '#10b981' },
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.catText,
                          { color: colors.text },
                          isActive && { color: '#ffffff', fontWeight: 'bold' },
                        ]}
                      >
                        📁 {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No tasks found. Tap the "+" button below to add your first task.
              </Text>
            </View>
          )
        }
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: colors.primary }]}
        onPress={handleAddTask}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  greetingGroup: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 12,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
  },
  actionBadgeText: {
    fontSize: 14,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  dashboardTop: {
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  clearSearch: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: 4,
  },
  statsScroll: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    width: 120,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 6,
  },
  pillsScroll: {
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8,
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
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 12,
  },
  catText: {
    fontSize: 11,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  centerContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
});
