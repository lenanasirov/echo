import { configureStore } from "@reduxjs/toolkit";

import  { memoriesReducer }  from "./slices/memoriesSlice";


export const store = configureStore({
  reducer: {
    memories: memoriesReducer,
  },
});