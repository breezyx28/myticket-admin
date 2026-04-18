import { analyticsUiReducer } from '@/app/analyticsUiSlice';
import { configureStore } from '@reduxjs/toolkit';
import { adminApi } from '@/services/adminApi';

export const store = configureStore({
  reducer: {
    analyticsUi: analyticsUiReducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(adminApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
