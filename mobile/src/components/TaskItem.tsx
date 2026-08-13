import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStartFocus?: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartFocus,
}) => {
  const { isDark, colors } = useTheme();
  const isCompleted = task.status === 'completed';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Subtasks progress calculation
  const totalSubTasks = task.subTasks?.length || 0;
  const completedSubTasks = task.subTasks?.filter((st) => st.completed).length || 0;
  const subTaskPercent = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;

  // Matching card background colors inspired by UI mockups
  const getCardBg = () => {
    if (isDark) return isCompleted ? '#1a1a1a' : '#242424';
    if (isCompleted) return '#f4f4f5';
    switch (task.priority) {
      case 'high': return '#fff7ed'; // Soft orange/peach
      case 'medium': return '#faf5ff'; // Soft purple/lavender
      default: return '#f0f9ff'; // Soft blue
    }
  };

  const getCategoryColor = () => {
    switch (task.category) {
      case 'Work': return { bg: '#e0f2fe', text: '#0284c7' };
      case 'Study': return { bg: '#f3e8ff', text: '#7e22ce' };
      case 'Personal': return { bg: '#fce7f3', text: '#be185d' };
      case 'Fitness': return { bg: '#dcfce7', text: '#15803d' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const catStyle = getCategoryColor();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getCardBg(),
          borderColor: isDark ? '#333333' : 'transparent',
        },
      ]}
    >
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          style={[styles.checkboxButton, isCompleted && styles.checkboxCompleted, { borderColor: isDark ? '#555' : '#cbd5e1' }]}
          onPress={() => onToggleComplete(task)}
        >
          {isCompleted ? <Text style={styles.checkmarkIcon}>✓</Text> : null}
        </TouchableOpacity>

        <View style={styles.titleGroup}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
              isCompleted && styles.completedText,
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>

          <View style={styles.badgeRow}>
            {task.category ? (
              <View style={[styles.catBadge, { backgroundColor: catStyle.bg }]}>
                <Text style={[styles.catBadgeText, { color: catStyle.text }]}>{task.category}</Text>
              </View>
            ) : null}

            <View style={[styles.priorityBadge, styles[task.priority]]}>
              <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.menuButton} onPress={() => onEdit(task)}>
          <Text style={[styles.menuDots, { color: colors.textSecondary }]}>⋮</Text>
        </TouchableOpacity>
      </View>

      {task.description ? (
        <Text
          style={[
            styles.description,
            { color: colors.textSecondary },
            isCompleted && styles.completedText,
          ]}
          numberOfLines={2}
        >
          {task.description}
        </Text>
      ) : null}

      {/* Progress Bar for Subtasks */}
      {totalSubTasks > 0 ? (
        <View style={styles.progressSection}>
          <View style={styles.progressTextRow}>
            <Text style={[styles.progressTitle, { color: colors.textSecondary }]}>Progress</Text>
            <Text style={[styles.progressPercentText, { color: colors.text }]}>{subTaskPercent}%</Text>
          </View>
          <View style={[styles.track, { backgroundColor: isDark ? '#3b3b3b' : '#e2e8f0' }]}>
            <View
              style={[
                styles.fill,
                { width: `${subTaskPercent}%`, backgroundColor: subTaskPercent === 100 ? '#16a34a' : colors.primary },
              ]}
            />
          </View>
        </View>
      ) : null}

      {/* Bottom info row with deadline time pill & quick actions */}
      <View style={[styles.cardFooter, { borderTopColor: isDark ? '#333333' : '#f1f5f9' }]}>
        <View style={styles.footerLeft}>
          {task.deadline ? (
            <View style={[styles.timePill, { backgroundColor: isDark ? '#2a2a2a' : '#ffffff' }]}>
              <Text style={styles.timePillText}>
                ⏰ {formatTime(task.deadline) || formatDate(task.deadline)}
              </Text>
            </View>
          ) : (
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {formatDate(task.dateTime)}
            </Text>
          )}
        </View>

        <View style={styles.footerActions}>
          {onStartFocus ? (
            <TouchableOpacity style={styles.focusBtn} onPress={() => onStartFocus(task)}>
              <Text style={styles.focusBtnText}>⏱️ Focus</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(task._id)}>
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkboxButton: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  checkmarkIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  low: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  },
  medium: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
  },
  high: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  menuButton: {
    paddingLeft: 8,
    paddingVertical: 2,
  },
  menuDots: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    marginLeft: 36,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.55,
  },
  progressSection: {
    marginLeft: 36,
    marginBottom: 10,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressTitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timePillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  dateText: {
    fontSize: 11,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  focusBtn: {
    backgroundColor: '#fffbebf0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  focusBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#b45309',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 14,
  },
});
