"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./store";

interface PageProps {
  children: ReactNode;
}

export default function ReduxProvider({ children }: PageProps) {
  return <Provider store={store}>{children}</Provider>;
}