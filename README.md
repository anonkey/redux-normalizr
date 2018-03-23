# redux-normalizr
[![Build Status](https://travis-ci.org/anonkey/redux-normalizr.svg?branch=master)](https://travis-ci.org/anonkey/redux-normalizr)

## Installation
`npm install --save redux-normalizr`

## Usage
### Functions

 - [normalizrMiddleware](#normalizrMiddleware) ⇒ ```Boolean```

 >Return a middleware for redux applyMiddleware function.

### Typedefs

 - [GetDataCb](#GetDataCb) ⇒ ```Object```

  > This callback fetch the data to normalize in the action


 - [PostNormalizeCb](#PostNormalizeCb) ⇒ ```Object```

  > This callback trigger after normalization and can mutate data

 - [OnNextCb](#OnNextCb) ⇒ ```Object```
  > This callback trigger just before leaving for mutate the action or dispatch actions

#### GetDataCb ⇒ ```Object```
This callback fetch the data to normalize in the action

**Kind**: Callback
**Returns**: ```Object``` - data to normalize  

| Param | Type | Description |
| --- | --- | --- |
| store | ```ReduxStore``` | redux store |
| action | ```ReduxAction``` | redux action |

<a name="PostNormalizeCb"></a>

#### PostNormalizeCb ⇒ ```Object```
This callback trigger after normalization and can mutate data

**Kind**: Callback
**Returns**: ```Object``` - mutated data  

| Param | Type | Description |
| --- | --- | --- |
| normalizedData | ```ReduxAction``` | redux action |

<a name="OnNextCb"></a>

#### OnNextCb ⇒ ```Object```
This callback trigger just before leaving for mutate the action or dispatch actions

**Kind**: Callback
**Returns**: ```Object``` - normalized data  

| Param | Type | Description |
| --- | --- | --- |
| store | ```ReduxStore``` | redux store |
| action | ```ReduxAction``` | redux action |
| normalizedData | ```ReduxAction``` | redux action |

### normalizrMiddleware(options) ⇒ ```Boolean```
Return a normalizer-middleware for redux

**Kind**: global function  
**Returns**: ```Boolean``` - shouldBeProcessed  

| Param | Type | Description |
| --- | --- | --- |
| options | ```Object``` | middleware options |
| options.getActionData | [GetDataCb](#GetDataCb) | getData in action object |
| options.onNextAction | [OnNextCb](#OnNextCb) | mutate action before sending |
| options.onNormalizeData | [PostNormalizeCb](#PostNormalizeCb) | mutate data after normalizr |
| options.actionFilter | ```String``` \| ```Regex``` | filter of action type to handle |

```js
import normalizrMiddleware from 'redux-normalizer'

applyMiddleware(normalizrMiddleware({}));
```

## Examples

### Simple use case

A simple usage could be :

```js
import { compose, createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import normalizrMiddleware from 'redux-normalizr';

export default (reducers, enableLogger) => initialState => createStore(
  reducers,
  initialState,
  compose(applyMiddleware(
      normalizrMiddleware({}),
      createLogger({
        duration: true,
        diff: true,
      }),
    )
  ))
```

In this case all actions with a field :
```js
{
  meta: {
    schema: normalizerSchema,
  }
}
```
will have it payload field replaced by :
```js
normalize(payload, schema)
```

### A use-case with redux-promise middleware


```js
/**
 *  Catch all resolved promise, normalize payload.data field,
 *  send normalized data to a reducer which act as localStore
 *  and send only id's to UI reducers
 */
const onNextAction = (store, action, normalizedData) => {
  store.dispatch({
    type: 'STORE_UPDATE',
    payload: normalizedData.entities,
  });

  return ({
    ...action,
    payload: {
      ...action.payload,
      data: normalizedData.result,
    },
  });
};

const getActionData = (store, action) => action.payload.data;

const normalizrConfig = {
  onNextAction,
  getActionData,
  actionFilter: /_FULFILLED$/,
};

/**
 * Create store with reducers and middlewares
 * @param  {Object}     reducers     Map of reducers
 * @param  {Boolean}    enableLogger enable redux logger middleware
 *                                    (can be done by setting LOGGER env var)
 * @return {ReduxStore} the redux store generated
 */
export default (reducers, enableLogger) => initialState => createStore(
  reducers,
  initialState,
  compose(applyMiddleware(
    promise(),
    normalizr(normalizrConfig),
    thunk,
  ))
);

```
