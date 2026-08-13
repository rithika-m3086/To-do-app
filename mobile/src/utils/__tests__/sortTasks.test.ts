import { sortTasks, calculateTaskScore } from '../sortTasks';
import { Task } from '../../types';

describe('sortTasks algorithm', () => {
  const baseTask: Omit<Task, '_id' | 'title' | 'priority' | 'status'> = {
    owner: 'user1',
    dateTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  it('sorts high priority before medium and low priority when deadline is equal', () => {
    const deadline = new Date(Date.now() + 10 * 3600 * 1000).toISOString(); // 10 hours from now

    const lowTask: Task = { ...baseTask, _id: '1', title: 'Low', priority: 'low', status: 'pending', deadline };
    const medTask: Task = { ...baseTask, _id: '2', title: 'Med', priority: 'medium', status: 'pending', deadline };
    const highTask: Task = { ...baseTask, _id: '3', title: 'High', priority: 'high', status: 'pending', deadline };

    const sorted = sortTasks([lowTask, highTask, medTask]);

    expect(sorted.map(t => t._id)).toEqual(['3', '2', '1']);
  });

  it('sorts tasks with earlier deadlines higher given the same priority', () => {
    const deadlineSoon = new Date(Date.now() + 2 * 3600 * 1000).toISOString(); // 2 hours
    const deadlineLater = new Date(Date.now() + 20 * 3600 * 1000).toISOString(); // 20 hours

    const taskLater: Task = { ...baseTask, _id: '1', title: 'Later', priority: 'medium', status: 'pending', deadline: deadlineLater };
    const taskSoon: Task = { ...baseTask, _id: '2', title: 'Soon', priority: 'medium', status: 'pending', deadline: deadlineSoon };

    const sorted = sortTasks([taskLater, taskSoon]);

    expect(sorted.map(t => t._id)).toEqual(['2', '1']);
  });

  it('always sorts completed tasks to the bottom regardless of priority or deadline', () => {
    const deadline = new Date(Date.now() + 1 * 3600 * 1000).toISOString();

    const completedHigh: Task = { ...baseTask, _id: 'c1', title: 'Done High', priority: 'high', status: 'completed', deadline };
    const pendingLow: Task = { ...baseTask, _id: 'p1', title: 'Pending Low', priority: 'low', status: 'pending', deadline };

    const sorted = sortTasks([completedHigh, pendingLow]);

    expect(sorted[sorted.length - 1]._id).toBe('c1');
    expect(sorted[0]._id).toBe('p1');
  });
});
