import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const { isDark, colors } = useTheme();
  const isCompleted = task.status === 'completed';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No deadline';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Invalid date' : d.toLocaleString();
  };

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
        <Text
          style={[
            styles.title,
            { color: colors.text },
            isCompleted && styles.completedText,
          ]}
        >
          {task.title}
        </Text>
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

      <View style={styles.datesRow}>
        {task.deadline ? (
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            Deadline: {formatDate(task.deadline)}
          </Text>
        ) : null}
      </View>

      <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
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
