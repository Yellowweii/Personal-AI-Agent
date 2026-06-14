import { SVGProps } from "react";
import { AgentLogoIcon } from "@/svgs/chatHeader";

export const UserAvatarIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

export const AssistantAvatarIcon = AgentLogoIcon;
