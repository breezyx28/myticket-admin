import type { RevenueChartRange } from '@/types/analytics';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type AnalyticsUiState = {
  revenueChartRange: RevenueChartRange;
};

const initialState: AnalyticsUiState = {
  revenueChartRange: '7d',
};

const analyticsUiSlice = createSlice({
  name: 'analyticsUi',
  initialState,
  reducers: {
    setRevenueChartRange(state, action: PayloadAction<RevenueChartRange>) {
      state.revenueChartRange = action.payload;
    },
  },
});

export const { setRevenueChartRange } = analyticsUiSlice.actions;
export const analyticsUiReducer = analyticsUiSlice.reducer;
