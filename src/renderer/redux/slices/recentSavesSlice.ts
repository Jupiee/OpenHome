import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SAV } from 'types/SAVTypes';
import { SaveRefMap } from 'types/types';
import { RootState } from '../store';

const initialState: SaveRefMap = {};

export const loadRecentSaves = createAsyncThunk(
  'recentSaves/load',
  async () => {
    return await window.electron.ipcRenderer.invoke('read-recent-saves');
  }
);

export const recentSavesSlice = createSlice({
  name: 'recentSaves',
  initialState,
  reducers: {
    upsertRecentSave: (state, action: PayloadAction<SAV>) => {
      if (!action.payload.filePath) {
        return state;
      }
      const saveRef = action.payload.getSaveRef();
      window.electron.ipcRenderer.sendMessage('add-recent-save', saveRef);
      state[action.payload.filePath] = saveRef;
    },
    removeRecentSave: (state, action: PayloadAction<string>) => {
      const filePath = action.payload;
      window.electron.ipcRenderer.sendMessage('remove-recent-save', filePath);
      delete state[filePath];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadRecentSaves.fulfilled, (state, action) => {
      Object.assign(state, action.payload);
    });
  },
});

export const { upsertRecentSave, removeRecentSave } = recentSavesSlice.actions;

export const selectRecentSaves = (state: RootState) => state.recentSaves;

export default recentSavesSlice.reducer;