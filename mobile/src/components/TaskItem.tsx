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
  onToggleSubTask?: (task: Task, subTaskIndex: number) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartFocus,
  onToggleSubTask,
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

  // Priority color styling based on extracted mesh gradient palette
  const getPriorityStyle = () => {
    switch (task.priority) {
      case 'high':
        return {
          bg: colors.highPriorityBg,
          tagBg: colors.highPriorityTag,
          text: isDark ? '#FF6B35' : '#C2410C',
        };
      case 'medium':
        return {
          bg: colors.mediumPriorityBg,
          tagBg: colors.mediumPriorityTag,
          text: isDark ? '#E6399B' : '#BE185D',
        };
      default:
        return {
          bg: colors.lowPriorityBg,
          tagBg: colors.lowPriorityTag,
          text: isDark ? '#38BDF8' : '#1D4ED8',
        };
    }
  };

  const priorityStyle = getPriorityStyle();

  const getCategoryColor = () => {
    switch (task.category) {
      case 'Work': return { bg: '#E0F2FE', text: '#0284C7' };
      case 'Study': return { bg: '#EAE3FF', text: '#5C3BFF' };
      case 'Personal': return { bg: '#FCE7F3', text: '#BE185D' };
      case 'Fitness': return { bg: '#DCFCE7', text: '#15803D' };
      default: return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const catStyle = getCategoryColor();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.card : colors.cardGlass,
          borderColor: isDark ? colors.border : 'rgba(255, 255, 255, 0.6)',
        },
      ]}
    >
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          style={[styles.checkboxButton, isCompleted && styles.checkboxCompleted]}
          onPress={() => onToggleComplete(task)}
        >
          {isCompleted ? <Text style={styles.checkmarkIcon}>✓</Text> : null}
        </TouchableOpacity>

        <View style={styles.titleGroup}>
          <Text
            style={[
              styles.title,
              { color: isDark ? colors.text : '#0F172A' },
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

            <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.tagBg }]}>
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
            { color: isDark ? colors.textSecondary : '#475569' },
            isCompleted && styles.completedText,
          ]}
          numberOfLines={2}
        >
          {task.description}
        </Text>
      ) : null}

      {/* Sub-Tasks Preview */}
      {totalSubTasks > 0 ? (
        <View style={styles.subTasksPreviewContainer}>
          <View style={styles.subTasksList}>
            {task.subTasks?.map((st, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.subTaskPreviewItem}
                onPress={() => onToggleSubTask && onToggleSubTask(task, idx)}
                activeOpacity={0.7}
              >
                <Text style={styles.subTaskBullet}>{st.completed ? '☑' : '☐'}</Text>
                <Text
                  style={[
                    styles.subTaskPreviewText,
                    { color: isDark ? colors.textSecondary : '#475569' },
                    st.completed && styles.subTaskCompletedText,
                  ]}
                  numberOfLines={1}
                >
                  {st.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Subtasks Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressTextRow}>
              <Text style={[styles.progressTitle, { color: isDark ? colors.textSecondary : '#64748b' }]}>Progress</Text>
              <Text style={[styles.progressPercentText, { color: colors.text }]}>{subTaskPercent}%</Text>
            </View>
            <View style={[styles.track, { backgroundColor: isDark ? '#3b3b3b' : 'rgba(0, 0, 0, 0.08)' }]}>
              <View
                style={[
                  styles.fill,
                  { width: `${subTaskPercent}%`, backgroundColor: subTaskPercent === 100 ? '#16a34a' : priorityStyle.tagBg },
                ]}
              />
            </View>
          </View>
        </View>
      ) : null}

      {/* Bottom info row with deadline time pill & quick actions */}
      <View style={[styles.cardFooter, { borderTopColor: isDark ? '#2a2a2a' : 'rgba(0, 0, 0, 0.06)' }]}>
        <View style={styles.footerLeft}>
          {task.deadline ? (
            <View style={styles.timePill}>
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
    marginBottom: 6,
  },
  checkboxButton: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#94a3b8',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  checkmarkIcon: {
    color: '#ffffff',
    fontSize: 13,
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
    color: '#ffffff',
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
    marginBottom: 8,
    marginLeft: 32,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  subTasksPreviewContainer: {
    marginLeft: 32,
    marginVertical: 6,
  },
  subTasksList: {
    marginBottom: 6,
    gap: 3,
  },
  subTaskPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subTaskBullet: {
    fontSize: 12,
    color: '#64748b',
  },
  subTaskPreviewText: {
    fontSize: 12,
    lineHeight: 16,
  },
  subTaskCompletedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  progressSection: {
    marginTop: 4,
    marginBottom: 4,
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
    paddingTop: 8,
    marginTop: 6,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  timePillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#E6399B',
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
    backgroundColor: '#FFEAD9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  focusBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 14,
  },
});
