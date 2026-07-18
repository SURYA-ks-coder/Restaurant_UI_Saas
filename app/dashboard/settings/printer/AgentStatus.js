"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Wifi, WifiOff, Copy } from "lucide-react";
import { Button, Tooltip, message } from "antd";
import ModalAnt from "@/components/ui/ModalAnt";
import { action, API, getAction } from "@/lib/API";
import { hasPermission } from "@/lib/auth";

const POLL_MS = 20000;

// Shows whether the branch's on-site print agent is connected to the server.
// When no agent is online, LAN printing falls back to the browser dialog.
export default function AgentStatus() {
  const [online, setOnline] = useState(null); // null = loading
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [generating, setGenerating] = useState(false);
  const canManage = hasPermission("print:manage");

  const fetchStatus = useCallback(async () => {
    try {
      const result = await getAction(API.PRINT_AGENT_STATUS);
      if (result?.statusCode === 200) setOnline(!!result?.data?.online);
    } catch {}
  }, []);

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, POLL_MS);
    return () => clearInterval(timer);
  }, [fetchStatus]);

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const result = await action(API.GENERATE_PRINT_AGENT_KEY, {}, "POST");
      if (result?.statusCode === 200) {
        setGeneratedKey(result?.data);
      } else {
        message.error(result?.message || "Failed to generate agent key");
      }
    } catch {
      message.error("Failed to generate agent key");
    } finally {
      setGenerating(false);
    }
  };

  // Ready-to-paste .env lines for the agent on the branch PC
  const envSnippet = generatedKey
    ? `BRANCH_ID=${generatedKey.branchId}\nAGENT_KEY=${generatedKey.agentKey}`
    : "";

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(envSnippet);
      message.success("Copied — paste into the agent's .env file");
    } catch {
      message.error("Could not copy — select and copy it manually");
    }
  };

  const closeKeyModal = () => {
    setKeyModalOpen(false);
    setGeneratedKey(null);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-2">
        {online === null ? (
          <span className="text-sm text-muted-foreground">
            Checking print agent…
          </span>
        ) : online ? (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <Wifi size={15} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Print agent online
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              — LAN printers receive jobs automatically
            </span>
          </>
        ) : (
          <>
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-gray-400" />
            <WifiOff size={15} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-600">
              Print agent offline
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              — printing falls back to the browser dialog
            </span>
          </>
        )}
      </div>

      {/* {canManage && ( */}
      <Tooltip title="Generate a credential for the on-site print agent app">
        <Button
          size="small"
          icon={<KeyRound size={13} />}
          onClick={() => setKeyModalOpen(true)}
        >
          Agent Key
        </Button>
      </Tooltip>
      {/* )} */}

      <ModalAnt
        isVisible={keyModalOpen}
        onClose={closeKeyModal}
        title="Print Agent Key"
        showOkButton={false}
        showCancelButton={false}
        width={480}
      >
        {generatedKey ? (
          <div className="space-y-3">
            <p className="text-sm text-red-600 font-medium">
              Copy this key now — it will not be shown again.
            </p>
            <div className="flex items-start gap-2">
              <pre className="flex-1 overflow-x-auto whitespace-pre-wrap break-all rounded bg-muted px-3 py-2 text-xs">
                {envSnippet}
              </pre>
              <Button
                size="small"
                icon={<Copy size={13} />}
                onClick={copyKey}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Paste both lines into the print agent&apos;s .env file on the
              branch PC (keep the SERVER_URL line), then restart the agent.
            </p>
            <div className="flex justify-end">
              <Button size="small" onClick={closeKeyModal}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">
              Generate a key for the on-site print agent. If a key already
              exists it will be <b>replaced</b>, and the running agent must be
              updated with the new key.
            </p>
            <div className="flex justify-end gap-2">
              <Button size="small" onClick={closeKeyModal}>
                Cancel
              </Button>
              <Button
                size="small"
                type="primary"
                loading={generating}
                onClick={handleGenerateKey}
              >
                Generate Key
              </Button>
            </div>
          </div>
        )}
      </ModalAnt>
    </div>
  );
}
