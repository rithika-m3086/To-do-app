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
import { AppBackground } from '../../components/AppBackground';
import { PomodoroTimerModal } from '../../components/PomodoroTimerModal';
import { sortTasks } from '../../utils/sortTasks';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskList'>;

type FilterOption = 'All' | 'Today' | 'Pending' | 'High Priority' | 'Completed';

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { tasks, isLoading, error, fetchTasks, toggleComplete, deleteTask, toggleSubTask } = useTasks();
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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    if (activeFilter === 'Pending' && t.status !== 'pending') return false;
    if (activeFilter === 'Completed' && t.status !== 'completed') return false;
    if (activeFilter === 'High Priority' && t.priority !== 'high') return false;
    if (activeFilter === 'Today') {
      const todayStr = new Date().toDateString();
      const taskDateStr = t.deadline ? new Date(t.deadline).toDateString() : new Date(t.dateTime).toDateString();
      if (todayStr !== taskDateStr) return false;
    }

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
    <AppBackground>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header: Clean username and avatar only */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <View style={[styles.avatarCircle, { backgroundColor: '#0077B6' }]}>
              <Text style={styles.avatarText}>{getUserName().charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={[styles.userNameText, { color: colors.text }]}>{getUserName()}</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.actionBadge, { borderColor: isDark ? colors.border : '#e2e8f0', backgroundColor: isDark ? '#121212' : '#ffffff' }]}
              onPress={toggleTheme}
            >
              <Text style={styles.actionBadgeText}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBadge, { borderColor: isDark ? colors.border : '#e2e8f0', backgroundColor: isDark ? '#121212' : '#ffffff' }]}
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
              onToggleSubTask={toggleSubTask}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            <View style={styles.dashboardTop}>
              {/* Search Bar */}
              <View style={[styles.searchContainer, { backgroundColor: isDark ? '#121212' : '#ffffff', borderColor: isDark ? colors.border : '#e2e8f0' }]}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search a task....."
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

              {/* Feature Summary Cards */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>this week</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
                {/* Lavender Accent Card */}
                <View style={[styles.featureCard, { backgroundColor: colors.lavenderCard }]}>
                  <View style={styles.featureCardHeader}>
                    <View style={styles.featureIconBadge}>
                      <Text style={styles.iconSymbol}>⏱️</Text>
                    </View>
                    <View style={styles.fractionBadge}>
                      <Text style={[styles.fractionText, { color: colors.lavenderText }]}>{completedCount}/{totalCount}</Text>
                    </View>
                  </View>
                  <Text style={[styles.featureTitle, { color: colors.lavenderText }]}>In Schedule</Text>
                  <Text style={[styles.featureSubText, { color: colors.lavenderText }]}>{pendingCount} task</Text>
                </View>

                {/* Vibrant Orange Accent Card */}
                <View style={[styles.featureCard, { backgroundColor: colors.orangeCard }]}>
                  <View style={styles.featureCardHeader}>
                    <View style={styles.featureIconBadge}>
                      <Text style={styles.iconSymbol}>🔥</Text>
                    </View>
                    <View style={styles.fractionBadge}>
                      <Text style={[styles.fractionText, { color: colors.orangeText }]}>{highPriorityCount}/{totalCount}</Text>
                    </View>
                  </View>
                  <Text style={[styles.featureTitle, { color: colors.orangeText }]}>High Priorities</Text>
                  <Text style={[styles.featureSubText, { color: colors.orangeText }]}>{highPriorityCount} task</Text>
                </View>
              </ScrollView>

              {/* Status Filter Pills with Count Badges */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
                {(['All', 'Today', 'Pending', 'High Priority', 'Completed'] as FilterOption[]).map((filter) => {
                  const count = getFilterCount(filter);
                  const isActive = activeFilter === filter;
                  return (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterPill,
                        { borderColor: isDark ? colors.border : '#e2e8f0', backgroundColor: isDark ? '#121212' : '#ffffff' },
                        isActive && { backgroundColor: '#0077B6', borderColor: '#0077B6' },
                      ]}
                      onPress={() => setActiveFilter(filter)}
                    >
                      <Text style={[styles.filterLabelText, { color: colors.text }, isActive && { color: '#ffffff', fontWeight: 'bold' }]}>
                        {filter}
                      </Text>
                      <View style={[styles.countBadge, isActive && { backgroundColor: '#ffffff' }]}>
                        <Text style={[styles.countBadgeText, isActive && { color: '#0077B6' }]}>{count}</Text>
                      </View>
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
                          { borderColor: isDark ? colors.border : '#e2e8f0', backgroundColor: isDark ? '#121212' : '#ffffff' },
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

              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Today's task</Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0077B6" />
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

        {/* Floating Action Button (FAB in Ocean Blue #0077B6) */}
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: '#0077B6' }]}
          onPress={handleAddTask}
          activeOpacity={0.85}
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
    </AppBackground>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 14,
  },
  actionBadgeText: {
    fontSize: 14,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  dashboardTop: {
    paddingBottom: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 24,
    height: 48,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  statsScroll: {
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 20,
  },
  featureCard: {
    width: 160,
    padding: 18,
    borderRadius: 24,
    justifyContent: 'space-between',
    minHeight: 130,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  featureCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSymbol: {
    fontSize: 16,
  },
  fractionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  fractionText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  featureSubText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    gap: 8,
  },
  filterLabelText: {
    fontSize: 13,
  },
  countBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
  },
  catText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
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
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
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
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#0077B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '300',
    marginTop: -2,
  },
});
