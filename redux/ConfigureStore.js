// redux
import { createStore, combineReducers, applyMiddleware} from 'redux';
//import thunk from 'redux-thunk';
const thunk = require('redux-thunk').thunk;//since version 3.x
import logger from 'redux-logger';
// reducers
import { leaders } from './leaders';
import { dishes } from './dishes';
import { comments } from './comments';
import { promotions } from './promotions';
import { favorites } from './favorites';

export const ConfigureStore = () => {
  const store = createStore(
    combineReducers({ leaders, dishes, comments, promotions, favorites }),
    applyMiddleware(thunk, logger)
  );
  return store;
};