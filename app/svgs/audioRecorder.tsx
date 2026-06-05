import { SVGProps } from "react";

export const StopRecordingIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    className="w-4 h-4"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <rect x="6" y="6" width="12" height="12" rx="1" />
  </svg>
);

export const MicrophoneIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
    />
  </svg>
);

export const TranscribingSpinnerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    className="w-4 h-4 animate-spin text-white/50"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
