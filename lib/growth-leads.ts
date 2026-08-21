import { persistGrowthLead, updateGrowthLeadDeliveryChannel } from './growth-lead-store';

export type GrowthLeadNotification = {
  reference: string;
  name: string;
  email: string;
  phone?: string;
  state: string;
  serviceId: string;
  serviceName: string;
  audience: string;
  goal: string;
  source: string;
  medium: string;
  campaign: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function configured(value?: string) {
  return value?.trim() || '';
}

async function sendWebhook(lead: GrowthLeadNotification) {
  const url = configured(process.env.LEADS_WEBHOOK_URL);
  if (!url) return false;
  const secret = configured(process.env.LEADS_WEBHOOK_SECRET);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(secret ? { authorization: `Bearer ${secret}` } : {})
    },
    body: JSON.stringify(lead),
    cache: 'no-store'
  });
  return response.ok;
}

async function sendResendEmail(lead: GrowthLeadNotification) {
  const apiKey = configured(process.env.RESEND_API_KEY);
  const to = configured(process.env.LEADS_NOTIFICATION_EMAIL);
  const from = configured(process.env.LEADS_FROM_EMAIL);
  if (!apiKey || !to || !from) return false;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: lead.email,
      subject: `New ${lead.audience.toUpperCase()} lead — ${lead.serviceName} — ${lead.state}`,
      html: `
        <h2>New New850.com lead</h2>
        <p><strong>Reference:</strong> ${escapeHtml(lead.reference)}</p>
        <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(lead.phone || 'Not provided')}</p>
        <p><strong>State:</strong> ${escapeHtml(lead.state)}</p>
        <p><strong>Service:</strong> ${escapeHtml(lead.serviceName)} (${escapeHtml(lead.serviceId)})</p>
        <p><strong>Goal:</strong> ${escapeHtml(lead.goal)}</p>
        <p><strong>Attribution:</strong> ${escapeHtml(lead.source)} / ${escapeHtml(lead.medium || 'none')} / ${escapeHtml(lead.campaign || 'none')}</p>
        <hr />
        <p>This message contains prospect contact data. Keep it inside approved business systems and do not place bureau credentials, SSNs, full account numbers, or identity documents in follow-up email.</p>
      `
    }),
    cache: 'no-store'
  });
  return response.ok;
}

export async function deliverGrowthLead(
  organizationId: string,
  identityKey: string,
  lead: GrowthLeadNotification,
  isTest = false
) {
  // The Owner OS inbox is the durable primary rail. External notification is additive.
  await persistGrowthLead(organizationId, identityKey, lead, 'owner-inbox', isTest);

  let channel = 'owner-inbox';
  const webhookConfigured = Boolean(configured(process.env.LEADS_WEBHOOK_URL));
  const resendConfigured = Boolean(
    configured(process.env.RESEND_API_KEY) &&
    configured(process.env.LEADS_NOTIFICATION_EMAIL) &&
    configured(process.env.LEADS_FROM_EMAIL)
  );

  if (webhookConfigured) {
    try {
      if (await sendWebhook(lead)) channel = 'owner-inbox+webhook';
    } catch {
      // Durable inbox already has the lead; notification failure must not lose it.
    }
  }

  if (resendConfigured) {
    try {
      if (await sendResendEmail(lead)) channel = `${channel}+email`;
    } catch {
      // Durable inbox already has the lead; notification failure must not lose it.
    }
  }

  if (channel !== 'owner-inbox') {
    try { await updateGrowthLeadDeliveryChannel(lead.reference, organizationId, channel); } catch { /* keep durable lead */ }
  }

  return { channel };
}
