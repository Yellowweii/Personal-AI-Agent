"use client";

import { Toaster } from "sonner";
import { TTS_TOGGLE } from "@/constants/textToSpeech";

export const AppToaster = () => {
  return (
    <Toaster
      className="app-toaster"
      theme="dark"
      position="top-center"
      duration={TTS_TOGGLE.feedbackDurationMs}
      closeButton={false}
      visibleToasts={3}
      expand={false}
      offset={72}
      mobileOffset={64}
      style={
        {
          "--gap": "10px",
        } as React.CSSProperties
      }
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-max shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/12 bg-[rgba(32,32,32,0.92)] px-5 py-2.5 text-sm font-medium text-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md",
          title: "whitespace-nowrap text-center leading-snug",
        },
      }}
    />
  );
};
