import { createHash } from "node:crypto";
import { del, put } from "@vercel/blob";

const MAX_SERVER_UPLOAD_BYTES = 4_000_000;
const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain"
]);

function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "file";
}

export function evidenceVaultConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function validateEvidenceFile(file: File) {
  if (!evidenceVaultConfigured()) throw new Error("EVIDENCE_VAULT_NOT_CONFIGURED");
  if (!file.size) throw new Error("EVIDENCE_FILE_EMPTY");
  if (file.size > MAX_SERVER_UPLOAD_BYTES) throw new Error("EVIDENCE_FILE_TOO_LARGE_FOR_SERVER_UPLOAD");
  if (!ALLOWED_CONTENT_TYPES.has(file.type)) throw new Error("EVIDENCE_FILE_TYPE_NOT_ALLOWED");
}

export async function uploadPrivateEvidence(input: {
  organizationId: string;
  clientId: string;
  file: File;
}) {
  validateEvidenceFile(input.file);
  const bytes = Buffer.from(await input.file.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const pathname = [
    "credit-repair-masters",
    safeSegment(input.organizationId),
    safeSegment(input.clientId),
    `${Date.now()}-${safeSegment(input.file.name)}`
  ].join("/");

  const blob = await put(pathname, bytes, {
    access: "private",
    addRandomSuffix: true,
    contentType: input.file.type
  });

  return {
    pathname: blob.pathname,
    sha256,
    size: input.file.size,
    contentType: input.file.type,
    cleanup: async () => {
      await del(blob.url);
    }
  };
}