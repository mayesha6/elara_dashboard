import { configureStore, Middleware } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { rootReducer } from "./features/rootReducer";
import { baseApi } from "./api/baseApi";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";

const autoResetApiMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  const result = next(action);
  if (
    action.type === "auth/setUser" ||
    action.type === "auth/logout" ||
    action.type === REHYDRATE
  ) {
    // Reset RTK Query cache on auth state changes
    storeApi.dispatch(baseApi.util.resetApiState());
  }
  return result;
};

const persistConfig = { key: "root", storage, whitelist: ["auth"] };
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware, autoResetApiMiddleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;