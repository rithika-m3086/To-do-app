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
    return isNaN(d.getTime()) ? 'Invalid date' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Subtasks progress calculation
  const totalSubTasks = task.subTasks?.length || 0;
  const completedSubTasks = task.subTasks?.filter((st) => st.completed).length || 0;
  const subTaskPercent = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;

  const getCardBg = () => {
    if (isDark) return isCompleted ? '#1a1a1a' : '#242424';
    if (isCompleted) return '#f4f4f5';
    switch (task.priority) {
      case 'high': return '#fff5f5';
      case 'medium': return '#fffbeb';
      default: return '#f0f9ff';
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getCardBg(),
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.topMetaRow}>
        <View style={styles.badgesGroup}>
          {task.category ? (
            <Text style={[styles.categoryBadge, { backgroundColor: isDark ? '#333333' : '#ffffff', color: colors.primary }]}>
              📁 {task.category}
            </Text>
          ) : null}
          <Text style={[styles.priorityBadge, styles[task.priority]]}>
            {task.priority.toUpperCase()}
          </Text>
        </View>

        {task.deadline ? (
          <Text style={[styles.dateBadge, { color: colors.textSecondary }]}>
            📅 {formatDate(task.deadline)}
          </Text>
        ) : null}
      </View>

      <Text
        style={[
          styles.title,
          { color: colors.text },
          isCompleted && styles.completedText,
        ]}
      >
        {task.title}
      </Text>

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

      {/* Subtasks Progress Bar */}
      {totalSubTasks > 0 ? (
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              Subtasks ({completedSubTasks}/{totalSubTasks})
            </Text>
            <Text style={[styles.progressPercent, { color: colors.text }]}>{subTaskPercent}%</Text>
          </View>
          <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#3a3a3a' : '#e4e4e7' }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${subTaskPercent}%`, backgroundColor: subTaskPercent === 100 ? '#16a34a' : colors.primary },
              ]}
            />
          </View>
        </View>
      ) : null}

      <View style={[styles.actionsRow, { borderTopColor: isDark ? '#3a3a3a' : '#e4e4e7' }]}>
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
            isCompleted ? styles.undoButton : styles.completeButton,
          ]}
          onPress={() => onToggleComplete(task)}
        >
          <Text style={[styles.actionButtonText, isCompleted ? styles.undoText : styles.completeText]}>
            {isCompleted ? '↩ Pending' : '✓ Complete'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryAction, { backgroundColor: isDark ? '#333' : '#ffffff', borderColor: colors.border }]}
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
    padding: 14,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  priorityBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
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
  dateBadge: {
    fontSize: 11,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  progressContainer: {
    marginVertical: 6,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 6,
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  focusButton: {
    backgroundColor: '#fffbebf0',
    borderColor: '#f59e0b',
  },
  focusButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#b45309',
  },
  completeButton: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  completeText: {
    color: '#15803d',
  },
  undoButton: {
    backgroundColor: '#ffedd5',
    borderColor: '#fdba74',
  },
  undoText: {
    color: '#c2410c',
  },
  secondaryAction: {
    borderColor: '#e4e4e7',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#b91c1c',
  },
});
