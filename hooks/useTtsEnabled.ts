"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  TTS_ENABLED_CHANGE_EVENT,
  TTS_ENABLED_DEFAULT,
  TTS_ENABLED_STORAGE_KEY,
} from "@/constants/textToSpeech";
import type { UseTtsEnabledReturn } from "@/interfaces/textToSpeech";

const readStoredTtsEnabled = (): boolean => {
  const stored = localStorage.getItem(TTS_ENABLED_STORAGE_KEY);
  if (stored === null) return TTS_ENABLED_DEFAULT;
  return stored === "true";
};

const subscribeTtsEnabled = (onStoreChange: () => void): (() => void) => {
  const handleChange = () => onStoreChange();
  window.addEventListener(TTS_ENABLED_CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);
  return () => {
    window.removeEventListener(TTS_ENABLED_CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
};

const writeTtsEnabled = (enabled: boolean): void => {
  localStorage.setItem(TTS_ENABLED_STORAGE_KEY, String(enabled));
  window.dispatchEvent(new Event(TTS_ENABLED_CHANGE_EVENT));
};

export const useTtsEnabled = (): UseTtsEnabledReturn => {
  const isTtsEnabled = useSyncExternalStore(
    subscribeTtsEnabled,
    readStoredTtsEnabled,
    () => TTS_ENABLED_DEFAULT,
  );

  const setTtsEnabled = useCallback((enabled: boolean) => {
    writeTtsEnabled(enabled);
  }, []);

  const toggleTtsEnabled = useCallback(() => {
    writeTtsEnabled(!readStoredTtsEnabled());
  }, []);

  return { isTtsEnabled, setTtsEnabled, toggleTtsEnabled };
};
