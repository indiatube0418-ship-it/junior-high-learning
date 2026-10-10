import test from 'node:test';
import assert from 'node:assert/strict';
import { nextReviewDate, isDue } from './srs';
import type { SrsState } from './types';

test('nextReviewDate - 新題正確 → stage1 interval3', () => {
  const state = nextReviewDate(null, true, '2024-01-01');
  assert.equal(state.stage, 1);
  assert.equal(state.intervalDays, 3);
  assert.equal(state.dueDate, '2024-01-04');
});

test('nextReviewDate - stage1 正確 → stage2 interval3', () => {
  const initialState: SrsState = { stage: 1 as const, intervalDays: 1, dueDate: '2024-01-01' };
  const state = nextReviewDate(initialState, true, '2024-01-01');
  assert.equal(state.stage, 2);
  assert.equal(state.intervalDays, 3);
});

test('nextReviewDate - stage2 正確 → stage3 interval7', () => {
  const initialState: SrsState = { stage: 2 as const, intervalDays: 3, dueDate: '2024-01-01' };
  const state = nextReviewDate(initialState, true, '2024-01-01');
  assert.equal(state.stage, 3);
  assert.equal(state.intervalDays, 7);
});

test('nextReviewDate - stage3 正確 → interval*2=14', () => {
  const initialState: SrsState = { stage: 3 as const, intervalDays: 7, dueDate: '2024-01-01' };
  const state = nextReviewDate(initialState, true, '2024-01-01');
  assert.equal(state.stage, 3);
  assert.equal(state.intervalDays, 14);
});

test('nextReviewDate - 錯誤 → stage1 interval1', () => {
  const initialState: SrsState = { stage: 3 as const, intervalDays: 7, dueDate: '2024-01-01' };
  const state = nextReviewDate(initialState, false, '2024-01-01');
  assert.equal(state.stage, 1);
  assert.equal(state.intervalDays, 1);
});

test('isDue - 未到期 false', () => {
  assert.equal(isDue({ stage: 1 as const, intervalDays: 1, dueDate: '2024-01-03' }, '2024-01-01'), false);
});

test('isDue - 今天到期 true', () => {
  assert.equal(isDue({ stage: 1 as const, intervalDays: 1, dueDate: '2024-01-01' }, '2024-01-01'), true);
});

test('isDue - 過期 true', () => {
  assert.equal(isDue({ stage: 1 as const, intervalDays: 1, dueDate: '2023-12-31' }, '2024-01-01'), true);
});
