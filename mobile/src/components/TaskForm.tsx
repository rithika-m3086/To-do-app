import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { InputField } from './InputField';
import { PrimaryButton } from './PrimaryButton';
import { Priority, Task, CreateTaskPayload, UpdateTaskPayload, SubTask } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TaskFormProps {
  initialValues?: Task;
  onSubmit: (payload: CreateTaskPayload | UpdateTaskPayload) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const DEFAULT_CATEGORIES = ['Work', 'Study', 'Personal', 'Fitness'];

export const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const { colors, isDark } = useTheme();
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [category, setCategory] = useState(initialValues?.category || 'Work');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCatInput, setShowCustomCatInput] = useState(false);
  const [priority, setPriority] = useState<Priority>(initialValues?.priority || 'medium');

  const [dateTime, setDateTime] = useState<Date>(
    initialValues?.dateTime ? new Date(initialValues.dateTime) : new Date()
  );
  const [deadline, setDeadline] = useState<Date | undefined>(
    initialValues?.deadline ? new Date(initialValues.deadline) : undefined
  );

  const [subTasks, setSubTasks] = useState<SubTask[]>(initialValues?.subTasks || []);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

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

  const handleAddSubTask = () => {
    if (!newSubTaskTitle.trim()) return;
    setSubTasks([...subTasks, { title: newSubTaskTitle.trim(), completed: false }]);
    setNewSubTaskTitle('');
  };

  const handleRemoveSubTask = (index: number) => {
    setSubTasks(subTasks.filter((_, i) => i !== index));
  };

  const handleToggleSubTask = (index: number) => {
    setSubTasks(
      subTasks.map((st, i) => (i === index ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      setCategory(customCategory.trim());
      setShowCustomCatInput(false);
      setCustomCategory('');
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
        category,
        priority,
        dateTime: dateTime.toISOString(),
        deadline: deadline ? deadline.toISOString() : undefined,
        subTasks,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={[styles.formCard, { backgroundColor: isDark ? colors.cardGlass : 'rgba(255, 255, 255, 0.88)', borderColor: isDark ? colors.border : 'rgba(255, 255, 255, 0.6)' }]}>
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

        {/* Categories */}
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Category</Text>
        <View style={styles.categoryRow}>
          {DEFAULT_CATEGORIES.concat(
            !DEFAULT_CATEGORIES.includes(category) ? [category] : []
          ).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryBadge,
                { borderColor: isDark ? colors.border : '#e2e8f0', backgroundColor: colors.card },
                category === cat && { backgroundColor: '#0284C7', borderColor: '#0284C7' },
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: colors.text },
                  category === cat && { color: '#ffffff', fontWeight: 'bold' },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.categoryBadge, styles.addCategoryBadge, { borderColor: '#0284C7' }]}
            onPress={() => setShowCustomCatInput(!showCustomCatInput)}
          >
            <Text style={[styles.categoryText, { color: '#0284C7', fontWeight: 'bold' }]}>+ Custom</Text>
          </TouchableOpacity>
        </View>

        {showCustomCatInput ? (
          <View style={styles.customCatRow}>
            <TextInput
              style={[styles.customCatInput, { borderColor: isDark ? colors.border : '#cbd5e1', color: colors.text, backgroundColor: colors.inputBackground }]}
              value={customCategory}
              onChangeText={setCustomCategory}
              placeholder="New Category name"
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity style={[styles.addCatBtn, { backgroundColor: '#0284C7' }]} onPress={handleAddCustomCategory}>
              <Text style={styles.addCatBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Priority Mapping (High: Orange #FF6B35, Medium: Pink #E6399B, Low: Blue #0284C7) */}
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Priority</Text>
        <View style={styles.priorityRow}>
          {(['low', 'medium', 'high'] as Priority[]).map((p) => {
            const isSelected = priority === p;
            const getPriorityTheme = () => {
              if (p === 'high') return { tag: '#FF6B35', bg: '#FFEAD9' };
              if (p === 'medium') return { tag: '#E6399B', bg: '#FCE4EC' };
              return { tag: '#0284C7', bg: '#E0F2FE' };
            };
            const themeColors = getPriorityTheme();

            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityOption,
                  { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#e2e8f0' },
                  isSelected && { backgroundColor: themeColors.bg, borderColor: themeColors.tag },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    { color: colors.textSecondary },
                    isSelected && { color: themeColors.tag, fontWeight: 'bold' },
                  ]}
                >
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Subtasks */}
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Sub-tasks Checklist</Text>
        <View style={styles.subTaskInputRow}>
          <TextInput
            style={[styles.subTaskInput, { borderColor: isDark ? colors.border : '#cbd5e1', color: colors.text, backgroundColor: colors.inputBackground }]}
            value={newSubTaskTitle}
            onChangeText={setNewSubTaskTitle}
            placeholder="Add sub-task item..."
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity style={[styles.subTaskAddBtn, { backgroundColor: '#0284C7' }]} onPress={handleAddSubTask}>
            <Text style={styles.subTaskAddBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {subTasks.map((st, index) => (
          <View key={index} style={[styles.subTaskRow, { borderColor: isDark ? colors.border : '#f1f5f9', backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.subTaskCheck} onPress={() => handleToggleSubTask(index)}>
              <Text style={[styles.subTaskCheckIcon, { color: colors.text }]}>{st.completed ? '☑' : '☐'}</Text>
              <Text style={[styles.subTaskTitle, { color: colors.text }, st.completed && styles.subTaskDone]}>
                {st.title}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemoveSubTask(index)}>
              <Text style={styles.subTaskRemove}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Dates */}
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Scheduled Date & Time</Text>
        <TouchableOpacity
          style={[styles.dateSelector, { borderColor: isDark ? colors.border : '#cbd5e1', backgroundColor: colors.card }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateSelectorText, { color: colors.text }]}>{dateTime.toLocaleString()}</Text>
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

        <Text style={[styles.sectionLabel, { color: colors.text }]}>Deadline (Due Date)</Text>
        <View style={styles.deadlineRow}>
          <TouchableOpacity
            style={[styles.dateSelector, { flex: 1, borderColor: isDark ? colors.border : '#cbd5e1', backgroundColor: colors.card }]}
            onPress={() => setShowDeadlineDatePicker(true)}
          >
            <Text style={[styles.dateSelectorText, { color: colors.text }]}>
              {deadline ? deadline.toLocaleString() : 'Select Deadline'}
            </Text>
          </TouchableOpacity>

          {deadline ? (
            <TouchableOpacity
              style={[styles.clearDeadlineButton, { borderColor: isDark ? colors.border : '#e2e8f0' }]}
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
  },
  addCategoryBadge: {
    borderStyle: 'dashed',
  },
  categoryText: {
    fontSize: 12,
  },
  customCatRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  customCatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addCatBtn: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 12,
  },
  addCatBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  priorityRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  subTaskInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  subTaskInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  subTaskAddBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 12,
  },
  subTaskAddBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  subTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 6,
  },
  subTaskCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subTaskCheckIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  subTaskTitle: {
    fontSize: 14,
    flex: 1,
  },
  subTaskDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  subTaskRemove: {
    fontSize: 16,
    color: '#EF4444',
    paddingHorizontal: 6,
  },
  dateSelector: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  dateSelectorText: {
    fontSize: 15,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearDeadlineButton: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  clearDeadlineText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 10,
  },
});
