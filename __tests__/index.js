import { normalize, schema } from 'normalizr';

import middleware from '../index';

console.log = jest.fn();

afterAll(() => {
  expect(console.log).not.toHaveBeenCalled();
});

const model = new schema.Entity('models');
const models = new schema.Array(model);

model.define({
  models,
  parent: model,
});

const fakeDataEmpty = {
  id: 1,
  parent: null,
  models: null,
};

const fakeDataEmptyNorm = normalize(fakeDataEmpty, model);
const fakeDataEmptyNextRes = { meta: { schema: model }, payload: fakeDataEmptyNorm, type: 'TEST_FULFILLED' };

const fakeData = {
  id: 1,
  models: [{ id: 2 }, { id: 3 }],
  parent: { id: 4 },
};

const fakeDataNorm = normalize(fakeData, model);
const fakeDataNextRes = { meta: { schema: model }, payload: fakeDataNorm, type: 'TEST_FULFILLED' };


test('test nulls', () => {
  expect(() => middleware(null)).not.toThrow();
  expect(() => middleware({ actionFilter: null })).not.toThrow();

  const tmp = middleware(null)({ dispatch: jest.fn() })(jest.fn());
  expect(() => tmp({ meta: null })).not.toThrow();
  expect(() => tmp({ meta: { schema: null } })).not.toThrow();
  expect(() => tmp({ meta: { schema: null }, type: null })).not.toThrow();
});

test('test action error', () => {
  const getActionData = jest.fn();
  const onNormalizeData = jest.fn();
  const onNextAction = jest.fn();

  const next = jest.fn();
  const action = {
    payload: fakeDataEmpty,
    meta: { schema: model },
    type: 'TEST_FULFILLED',
    error: true,
  };

  middleware({
    getActionData,
    onNormalizeData,
    onNextAction,
  })({ dispatch: jest.fn() })(next)(action);
  expect(next).toHaveBeenCalledWith(action);
  expect(getActionData).not.toHaveBeenCalled();
  expect(onNormalizeData).not.toHaveBeenCalled();
  expect(onNextAction).not.toHaveBeenCalled();
});

test('empty data', () => {
  const next = jest.fn();

  middleware(null)()(next)({ payload: fakeDataEmpty, meta: { schema: model }, type: 'TEST_FULFILLED' });
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(fakeDataEmptyNextRes);
});

test('relational data', () => {
  const next = jest.fn();

  middleware(null)()(next)({ payload: fakeData, meta: { schema: model }, type: 'TEST_FULFILLED' });
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(fakeDataNextRes);
});

test('callbacksTests default', () => {
  const getActionData = jest.fn((store, action) => action.payload);
  const onNormalizeData = jest.fn(data => data);
  const onNextAction = jest.fn((store, action, normalizedData) => ({
    ...action,
    payload: normalizedData,
  }));
  const store = { dispatch: jest.fn() };
  const next = jest.fn();
  const action = {
    payload: fakeData,
    meta: { schema: model },
    type: 'TEST_FULFILLED',
  };

  middleware({
    getActionData,
    onNormalizeData,
    onNextAction,
  })(store)(next)(action);
  expect(getActionData).toHaveBeenCalledWith(store, action);
  expect(onNormalizeData).toHaveBeenCalledWith(fakeDataNorm);
  expect(onNextAction).toHaveBeenCalledWith(store, action, fakeDataNorm);
  expect(next).toHaveBeenCalledWith(fakeDataNextRes);
});

test('callbacksTests custom', () => {
  const getActionData = jest.fn((store, action) => action.payload.data);
  const onNormalizeData = jest.fn(data => data.result);
  const onNextAction = jest.fn((store, action, normalizedData) => ({
    ...action,
    payload: {
      ...action.payload,
      data: normalizedData,
    },
  }));


  const store = { dispatch: jest.fn() };
  const next = jest.fn();
  const action = {
    payload: {
      junk: true,
      data: fakeData,
    },
    meta: { schema: model },
    type: 'TEST_FULFILLED',
  };
  const nextResult = {
    payload: {
      junk: true,
      data: fakeDataNorm.result,
    },
    meta: { schema: model },
    type: 'TEST_FULFILLED',
  };

  middleware({
    getActionData,
    onNormalizeData,
    onNextAction,
  })(store)(next)(action);
  expect(getActionData).toHaveBeenCalledWith(store, action);
  expect(onNormalizeData).toHaveBeenCalledWith(fakeDataNorm);
  expect(onNextAction).toHaveBeenCalledWith(store, action, fakeDataNorm.result);
  expect(next).toHaveBeenCalledWith(nextResult);
});

// TODO: callbacks with dummy data handling tests | filter tests
