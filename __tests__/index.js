import { normalize, schema } from 'normalizr';
import _ from 'lodash';

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
const fakeDataEmptyNextRes = { meta: { schema: model }, payload: { data: fakeDataEmptyNorm.result }, type: 'TEST_FULFILLED' };
const fakeDataEmptyDispatchRes = { payload: fakeDataEmptyNorm.entities, type: 'STORE_UPDATE' };

const fakeData = {
  id: 1,
  models: [{ id: 2 }, { id: 3 }],
  parent: { id: 4 },
};

const fakeDataNorm = normalize(fakeData, model);
const fakeDataNextRes = { meta: { schema: model }, payload: { data: fakeDataNorm.result }, type: 'TEST_FULFILLED' };
const fakeDataDispatchRes = { payload: fakeDataNorm.entities, type: 'STORE_UPDATE' };


test('test nulls', () => {
  expect(() => middleware(null)).not.toThrow();
  expect(() => middleware({ actionFilter: null })).not.toThrow();

  const tmp = middleware(null)({ dispatch: jest.fn() })(jest.fn());
  expect(() => tmp({ meta: null })).not.toThrow();
  expect(() => tmp({ meta: { schema: null } })).not.toThrow();
  expect(() => tmp({ meta: { schema: null }, type: null })).not.toThrow();
});

test('test nulls', () => {
  expect(() => middleware(null)).not.toThrow();
  expect(() => middleware({ actionFilter: null })).not.toThrow();

  const tmp = middleware(null)({ dispatch: jest.fn() })(jest.fn());
  expect(() => tmp({ payload: null })).not.toThrow();
  expect(() => tmp({ payload: { data: null } })).not.toThrow();
  expect(() => tmp({ payload: { data: {} }, meta: null })).not.toThrow();
  expect(() => tmp({ payload: { data: {} }, meta: { schema: null } })).not.toThrow();
  expect(() => tmp({ payload: { data: {} }, meta: { schema: model }, type: null })).not.toThrow();
});

test('empty data', () => {
  const dispatch = jest.fn();
  const next = jest.fn();

  middleware(null)({ dispatch })(next)({ payload: { data: fakeDataEmpty }, meta: { schema: model }, type: 'TEST_FULFILLED' });
  expect(dispatch).toHaveBeenCalledTimes(1);
  expect(dispatch).toHaveBeenCalledWith(fakeDataEmptyDispatchRes);
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(fakeDataEmptyNextRes);
});

test('relational data', () => {
  const dispatch = jest.fn();
  const next = jest.fn();

  middleware(null)({ dispatch })(next)({ payload: { data: fakeData }, meta: { schema: model }, type: 'TEST_FULFILLED' });
  expect(dispatch).toHaveBeenCalledTimes(1);
  expect(dispatch).toHaveBeenCalledWith(fakeDataDispatchRes);
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(fakeDataNextRes);
});
