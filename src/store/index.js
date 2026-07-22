// import { configureStore } from "@reduxjs/toolkit";

// export const store = configureStore({
//   reducer: {},
// });

import { configureStore } from "@reduxjs/toolkit";


function testReducer(state = {}, action) {
  return state;
}


export const store = configureStore({
  reducer: {
    test: testReducer,
  },
});