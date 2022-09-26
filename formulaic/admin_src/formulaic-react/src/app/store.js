import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../components/counter/counterSlice';
import fieldsReducer from '../components/fields/fieldsSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    fields: fieldsReducer
  },
});
