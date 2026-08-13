import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types';

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
  const isCompleted = task.status === 'completed';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No deadline';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Invalid date' : d.toLocaleString();
  };

  return (
    <View style={[styles.card, isCompleted && styles.completedCard]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, isCompleted && styles.completedText]}>
          {task.title}
        </Text>
        <Text style={[styles.priorityBadge, styles[task.priority]]}>
          {task.priority.toUpperCase()}
        </Text>
      </View>

      {task.description ? (
        <Text style={[styles.description, isCompleted && styles.completedText]}>
          {task.description}
        </Text>
      ) : null}

      <View style={styles.datesRow}>
        {task.deadline ? (
          <Text style={styles.dateText}>Deadline: {formatDate(task.deadline)}</Text>
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, isCompleted ? styles.undoButton : styles.completeButton]}
          onPress={() => onToggleComplete(task)}
        >
          <Text style={styles.actionButtonText}>
            {isCompleted ? 'Mark Pending' : 'Mark Complete'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(task)}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(task._id)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  completedCard: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
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
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888888',
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
    color: '#777777',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  completeButton: {
    backgroundColor: '#e6f4ea',
    borderColor: '#a8dab5',
  },
  undoButton: {
    backgroundColor: '#fff3e0',
    borderColor: '#ffe0b2',
  },
  deleteButton: {
    backgroundColor: '#fce8e6',
    borderColor: '#fad1d1',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
});
