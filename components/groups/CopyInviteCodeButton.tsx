"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyInviteCodeButtonProps = {
  inviteCode: string;
};

export function CopyInviteCodeButton({ inviteCode }: CopyInviteCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copyCode}
      className="focus-ring flex items-center gap-2 rounded text-sm text-muted-foreground transition hover:text-foreground"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied!" : `Invite code ${inviteCode}`}
    </button>
  );
}
