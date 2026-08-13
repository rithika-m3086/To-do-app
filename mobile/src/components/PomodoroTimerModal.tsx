import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../types';
import { useTheme } from '../context/ThemeContext';

interface PomodoroTimerModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
}

export const PomodoroTimerModal: React.FC<PomodoroTimerModalProps> = ({
  visible,
  task,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const FOCUS_TIME_SECONDS = 25 * 60; // 25 minutes
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_TIME_SECONDS);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  useEffect(() => {
    if (visible) {
      setSecondsLeft(FOCUS_TIME_SECONDS);
      setIsActive(false);
    }
  }, [visible]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(FOCUS_TIME_SECONDS);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
    const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
    return `${minsStr}:${secsStr}`;
  };

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#e2e8f0' }]}>
          <Text style={[styles.modalHeader, { color: colors.text }]}>⏱️ Pomodoro Focus Session</Text>
          
          <Text style={[styles.taskTitle, { color: colors.primary }]} numberOfLines={2}>
            {task.title}
          </Text>

          <View style={styles.timerDisplay}>
            <Text style={[styles.timerText, { color: colors.text }]}>{formatTime(secondsLeft)}</Text>
            {secondsLeft === 0 ? (
              <Text style={styles.finishedText}>🎉 Focus session completed! Great job!</Text>
            ) : null}
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                isActive ? styles.pauseButton : styles.startButton,
              ]}
              onPress={toggleTimer}
            >
              <Text style={styles.buttonText}>{isActive ? 'Pause' : 'Start Focus'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.resetButton, { borderColor: isDark ? colors.border : '#cbd5e1' }]}
              onPress={resetTimer}
            >
              <Text style={[styles.resetButtonText, { color: colors.text }]}>Reset</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  timerDisplay: {
    alignItems: 'center',
    marginVertical: 16,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  finishedText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    width: '100%',
  },
  controlButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#16a34a',
  },
  pauseButton: {
    backgroundColor: '#FF6B00',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  resetButtonText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  closeButton: {
    marginTop: 16,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
