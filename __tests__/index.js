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
  const nullTypeData = { payload: fakeData, meta: { schema: model }, type: null };
  expect(() => middleware(null)).not.toThrow();
  expect(() => middleware({ actionFilter: null })).not.toThrow();

  const tmp = middleware(null)({ dispatch: jest.fn() })(jest.fn());
  expect(() => tmp({ meta: null })).not.toThrow();
  expect(() => tmp({ meta: { schema: null } })).not.toThrow();
  expect(() => tmp({ meta: { schema: null }, type: null })).not.toThrow();
  expect(() => middleware({ filter: /_FULFILLED/ })()(() => null)(nullTypeData)).not.toThrow();
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
  const emptyData = { payload: fakeDataEmpty, meta: { schema: model }, type: 'TEST_FULFILLED' };

  middleware(null)()(next)(emptyData);
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(fakeDataEmptyNextRes);
});

test('relational data', () => {
  const next = jest.fn();
  const relationalData = { payload: fakeData, meta: { schema: model }, type: 'TEST_FULFILLED' };

  middleware(null)()(next)(relationalData);
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

test('filter', () => {
  const next = jest.fn();
  const inputDataNotMatching = { payload: fakeData, meta: { schema: model }, type: 'TEST_PENDING' };
  const inputDataMatching = { payload: fakeData, meta: { schema: model }, type: 'TEST_FULFILLED' };
  const filter = /_FULFILLED/;

  middleware({ filter })()(next)(inputDataNotMatching);
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(inputDataNotMatching);

  middleware({ filter })()(next)(inputDataMatching);

  expect(next).toHaveBeenCalledTimes(2);
  expect(next).toHaveBeenLastCalledWith(fakeDataNextRes);
});

test('dummy callbacks', () => {
  const getActionData = jest.fn(() => null);
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
  expect(() => middleware({
    getActionData,
    onNormalizeData,
    onNextAction,
  })(store)(next)(action)).not.toThrow();

  expect(getActionData).toHaveBeenCalledWith(store, action);
  expect(onNormalizeData).not.toHaveBeenCalled();
  expect(onNextAction).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalledWith(action);
});

// TODO: callbacks onNormalizeData onNextAction with dummy data handling tests
