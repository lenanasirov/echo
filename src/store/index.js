import { configureStore } from "@reduxjs/toolkit";

import  { memoriesReducer }  from "./slices/memoriesSlice";
import { echoCyclesReducer } from "./slices/echoCyclesSlice";


export const store = configureStore({
  reducer: {
    memories: memoriesReducer,
    echoCycle: echoCyclesReducer
  },
});