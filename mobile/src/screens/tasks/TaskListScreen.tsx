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
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());

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

  // Generate 7-day strip centered around current date
  const generateDateStrip = () => {
    const dates = [];
    const today = new Date();
    for (let i = -2; i <= 4; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push({
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: d.getDate() === today.getDate(),
      });
    }
    return dates;
  };

  const dateStrip = generateDateStrip();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.background : '#f8fafc' }]} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
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
            <Text style={styles.actionBadgeText}>{isDark ? '☀️' : '🌙'}</Text>
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
            <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
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

            {/* Summary Stat Feature Cards (Inspired by UI mockup) */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>this week</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
              {/* Lavender Card: In Schedule */}
              <View style={[styles.featureCard, { backgroundColor: isDark ? '#2e1065' : '#e9d5ff' }]}>
                <View style={styles.featureCardHeader}>
                  <View style={styles.featureIconBadge}>
                    <Text style={styles.iconSymbol}>⏱️</Text>
                  </View>
                  <View style={styles.fractionBadge}>
                    <Text style={styles.fractionText}>{completedCount}/{totalCount}</Text>
                  </View>
                </View>
                <Text style={[styles.featureTitle, { color: isDark ? '#f3e8ff' : '#4c1d95' }]}>In Schedule</Text>
                <Text style={[styles.featureSubText, { color: isDark ? '#c084fc' : '#6b21a8' }]}>{pendingCount} task</Text>
              </View>

              {/* Coral/Orange Card: High Priorities */}
              <View style={[styles.featureCard, { backgroundColor: isDark ? '#7c2d12' : '#ffedd5' }]}>
                <View style={styles.featureCardHeader}>
                  <View style={styles.featureIconBadge}>
                    <Text style={styles.iconSymbol}>🔥</Text>
                  </View>
                  <View style={styles.fractionBadge}>
                    <Text style={styles.fractionText}>{highPriorityCount}/{totalCount}</Text>
                  </View>
                </View>
                <Text style={[styles.featureTitle, { color: isDark ? '#ffedd5' : '#9a3412' }]}>High Priorities</Text>
                <Text style={[styles.featureSubText, { color: isDark ? '#fdba74' : '#c2410c' }]}>{highPriorityCount} task</Text>
              </View>
            </ScrollView>

            {/* Calendar Date Selector Strip */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStripScroll}>
              {dateStrip.map((item) => {
                const isSelected = selectedDate === item.dayNum;
                return (
                  <TouchableOpacity
                    key={item.dayNum}
                    style={[
                      styles.datePill,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      isSelected && { backgroundColor: '#0f172a', borderColor: '#0f172a' },
                    ]}
                    onPress={() => setSelectedDate(item.dayNum)}
                  >
                    <Text style={[styles.dateNum, { color: colors.text }, isSelected && { color: '#ffffff' }]}>
                      {item.dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
                      { borderColor: colors.border, backgroundColor: colors.card },
                      isActive && { backgroundColor: '#0284c7', borderColor: '#0284c7' },
                    ]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <Text style={[styles.filterLabelText, { color: colors.text }, isActive && { color: '#ffffff', fontWeight: 'bold' }]}>
                      {filter}
                    </Text>
                    <View style={[styles.countBadge, isActive && { backgroundColor: '#ffffff' }]}>
                      <Text style={[styles.countBadgeText, isActive && { color: '#0284c7' }]}>{count}</Text>
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

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Today's task</Text>
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
    borderRadius: 12,
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
    height: 46,
    elevation: 1,
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
    marginBottom: 10,
  },
  statsScroll: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  featureCard: {
    width: 155,
    padding: 16,
    borderRadius: 24,
    justifyContent: 'space-between',
    minHeight: 125,
  },
  featureCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSymbol: {
    fontSize: 16,
  },
  fractionBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  fractionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  featureSubText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateStripScroll: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  datePill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateNum: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pillsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 14,
  },
  catText: {
    fontSize: 12,
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
