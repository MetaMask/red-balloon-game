"use client";

import { useState } from "react";
import { LinkIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import copy from "copy-to-clipboard";

export const CopyToClipboard = ({
  value,
  className,
}: {
  value: string;
  className?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const onCopyLink = async (linkToCopy: string) => {
    copy(linkToCopy);
    setCopied(true);
  };

  return (
    <Button
      onClick={() => onCopyLink(value)}
      className={className}
      variant="action"
      size="smpill"
    >
      <LinkIcon />
      {copied ? "COPIED!" : "COPY LINK"}
    </Button>
  );
};
