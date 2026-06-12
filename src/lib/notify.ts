import { supabase } from "@/integrations/supabase/client";

/**
 * Fire-and-forget email send via the shared transactional email function.
 * Failures are logged but never block the calling flow.
 */
export async function notify(
  templateName: string,
  recipientEmail: string | null | undefined,
  templateData: Record<string, any> = {},
  idempotencyKey?: string,
) {
  if (!recipientEmail) return;
  try {
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName,
        recipientEmail,
        idempotencyKey: idempotencyKey ?? `${templateName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        templateData,
      },
    });
  } catch (e) {
    console.warn("notify failed", templateName, e);
  }
}

export const ADMIN_EMAIL = "info@ftfaacademy.nl";
