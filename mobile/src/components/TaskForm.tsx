import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { InputField } from './InputField';
import { PrimaryButton } from './PrimaryButton';
import { Priority, Task, CreateTaskPayload, UpdateTaskPayload } from '../types';

interface TaskFormProps {
  initialValues?: Task;
  onSubmit: (payload: CreateTaskPayload | UpdateTaskPayload) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [priority, setPriority] = useState<Priority>(initialValues?.priority || 'medium');
  const [dateTime, setDateTime] = useState<Date>(
    initialValues?.dateTime ? new Date(initialValues.dateTime) : new Date()
  );
  const [deadline, setDeadline] = useState<Date | undefined>(
    initialValues?.deadline ? new Date(initialValues.deadline) : undefined
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDeadlineDatePicker, setShowDeadlineDatePicker] = useState(false);
  const [showDeadlineTimePicker, setShowDeadlineTimePicker] = useState(false);

  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleDateTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateTime((prev) => {
        const updated = new Date(selectedDate);
        updated.setHours(prev.getHours());
        updated.setMinutes(prev.getMinutes());
        return updated;
      });
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setDateTime((prev) => {
        const updated = new Date(prev);
        updated.setHours(selectedDate.getHours());
        updated.setMinutes(selectedDate.getMinutes());
        return updated;
      });
    }
  };

  const handleDeadlineDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDeadlineDatePicker(false);
    if (selectedDate) {
      const base = deadline || new Date();
      const updated = new Date(selectedDate);
      updated.setHours(base.getHours());
      updated.setMinutes(base.getMinutes());
      setDeadline(updated);
      setShowDeadlineTimePicker(true);
    }
  };

  const handleDeadlineTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDeadlineTimePicker(false);
    if (selectedDate) {
      setDeadline((prev) => {
        const base = prev || new Date();
        const updated = new Date(base);
        updated.setHours(selectedDate.getHours());
        updated.setMinutes(selectedDate.getMinutes());
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError(null);
    setSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        dateTime: dateTime.toISOString(),
        deadline: deadline ? deadline.toISOString() : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPrioritySelectedStyle = (p: Priority) => {
    if (priority !== p) return null;
    switch (p) {
      case 'low':
        return styles.prioritySelectedLow;
      case 'medium':
        return styles.prioritySelectedMedium;
      case 'high':
        return styles.prioritySelectedHigh;
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <InputField
        label="Title *"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (titleError) setTitleError(null);
        }}
        placeholder="Enter task title"
        error={titleError}
      />

      <InputField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Enter task description"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.sectionLabel}>Priority</Text>
      <View style={styles.priorityRow}>
        {(['low', 'medium', 'high'] as Priority[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.priorityOption, getPrioritySelectedStyle(p)]}
            onPress={() => setPriority(p)}
          >
            <Text
              style={[
                styles.priorityText,
                priority === p && styles.priorityTextSelected,
              ]}
            >
              {p.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Scheduled Date & Time</Text>
      <TouchableOpacity
        style={styles.dateSelector}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateSelectorText}>{dateTime.toLocaleString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dateTime}
          mode="date"
          display="default"
          onChange={handleDateTimeChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={dateTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Text style={styles.sectionLabel}>Deadline (Due Date)</Text>
      <View style={styles.deadlineRow}>
        <TouchableOpacity
          style={[styles.dateSelector, { flex: 1 }]}
          onPress={() => setShowDeadlineDatePicker(true)}
        >
          <Text style={styles.dateSelectorText}>
            {deadline ? deadline.toLocaleString() : 'Select Deadline'}
          </Text>
        </TouchableOpacity>

        {deadline ? (
          <TouchableOpacity
            style={styles.clearDeadlineButton}
            onPress={() => setDeadline(undefined)}
          >
            <Text style={styles.clearDeadlineText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {showDeadlineDatePicker && (
        <DateTimePicker
          value={deadline || new Date()}
          mode="date"
          display="default"
          onChange={handleDeadlineDateChange}
        />
      )}

      {showDeadlineTimePicker && (
        <DateTimePicker
          value={deadline || new Date()}
          mode="time"
          display="default"
          onChange={handleDeadlineTimeChange}
        />
      )}

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title={isEditing ? 'Update Task' : 'Create Task'}
          onPress={handleSubmit}
          loading={submitting}
        />
        <PrimaryButton
          title="Cancel"
          onPress={onCancel}
          variant="secondary"
          disabled={submitting}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
  },
  priorityRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  prioritySelectedLow: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  prioritySelectedMedium: {
    backgroundColor: '#fef3c7',
    borderColor: '#d97706',
  },
  prioritySelectedHigh: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
  },
  priorityText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666666',
  },
  priorityTextSelected: {
    color: '#111111',
  },
  dateSelector: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  dateSelectorText: {
    fontSize: 15,
    color: '#333333',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearDeadlineButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
  },
  clearDeadlineText: {
    fontSize: 13,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 30,
  },
});
