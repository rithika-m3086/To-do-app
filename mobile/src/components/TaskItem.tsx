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
    if (!dateStr) return 'No deadline';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Invalid date' : d.toLocaleString();
  };

  // Subtasks progress calculation
  const totalSubTasks = task.subTasks?.length || 0;
  const completedSubTasks = task.subTasks?.filter((st) => st.completed).length || 0;
  const subTaskPercent = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        isCompleted && (isDark ? styles.completedCardDark : styles.completedCardLight),
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleCategoryGroup}>
          {task.category ? (
            <Text style={[styles.categoryBadge, { backgroundColor: colors.headerBackground, color: colors.primary, borderColor: colors.border }]}>
              {task.category}
            </Text>
          ) : null}
          <Text
            style={[
              styles.title,
              { color: colors.text },
              isCompleted && styles.completedText,
            ]}
          >
            {task.title}
          </Text>
        </View>

        <Text style={[styles.priorityBadge, styles[task.priority]]}>
          {task.priority.toUpperCase()}
        </Text>
      </View>

      {task.description ? (
        <Text
          style={[
            styles.description,
            { color: colors.textSecondary },
            isCompleted && styles.completedText,
          ]}
        >
          {task.description}
        </Text>
      ) : null}

      {/* Subtasks Progress Bar */}
      {totalSubTasks > 0 ? (
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              Subtasks: {completedSubTasks}/{totalSubTasks} ({subTaskPercent}%)
            </Text>
          </View>
          <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${subTaskPercent}%`, backgroundColor: subTaskPercent === 100 ? '#16a34a' : colors.primary },
              ]}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.datesRow}>
        {task.deadline ? (
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            Deadline: {formatDate(task.deadline)}
          </Text>
        ) : null}
      </View>

      <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
        {onStartFocus ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.focusButton]}
            onPress={() => onStartFocus(task)}
          >
            <Text style={styles.focusButtonText}>⏱️ Focus</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[
            styles.actionButton,
            { borderColor: colors.border, backgroundColor: colors.card },
            isCompleted ? styles.undoButton : styles.completeButton,
          ]}
          onPress={() => onToggleComplete(task)}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            {isCompleted ? 'Mark Pending' : 'Mark Complete'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => onEdit(task)}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(task._id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
  },
  completedCardLight: {
    backgroundColor: '#f9f9f9',
  },
  completedCardDark: {
    backgroundColor: '#181818',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleCategoryGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 6,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  priorityBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
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
  progressContainer: {
    marginBottom: 8,
  },
  progressTextRow: {
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  datesRow: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 4,
  },
  focusButton: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  focusButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#b45309',
  },
  completeButton: {
    backgroundColor: '#e6f4ea',
  },
  undoButton: {
    backgroundColor: '#fff3e0',
  },
  deleteButton: {
    backgroundColor: '#fce8e6',
    borderColor: '#fad1d1',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
});
