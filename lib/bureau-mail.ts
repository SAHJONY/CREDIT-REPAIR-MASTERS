export type CreditBureauId = 'equifax' | 'experian' | 'transunion';

export type PostalAddress = {
  name?: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  country: 'US';
};

export const creditBureauMailingAddresses: Record<CreditBureauId, PostalAddress> = {
  equifax: {
    company: 'Equifax Information Services, LLC',
    addressLine1: 'P.O. Box 740256',
    city: 'Atlanta',
    state: 'GA',
    zip: '30374-0256',
    country: 'US'
  },
  experian: {
    company: 'Experian',
    addressLine1: 'P.O. Box 4500',
    city: 'Allen',
    state: 'TX',
    zip: '75013',
    country: 'US'
  },
  transunion: {
    company: 'TransUnion Consumer Solutions',
    addressLine1: 'P.O. Box 2000',
    city: 'Chester',
    state: 'PA',
    zip: '19016-2000',
    country: 'US'
  }
};

function requiredEnv(name: string) {
  return process.env[name]?.trim() || '';
}

export function bureauMailProviderConfigured() {
  return Boolean(
    requiredEnv('LOB_API_KEY') &&
    requiredEnv('NEW850_MAIL_FROM_NAME') &&
    requiredEnv('NEW850_MAIL_FROM_ADDRESS_LINE1') &&
    requiredEnv('NEW850_MAIL_FROM_CITY') &&
    requiredEnv('NEW850_MAIL_FROM_STATE') &&
    requiredEnv('NEW850_MAIL_FROM_ZIP')
  );
}

export function new850ReturnAddress(): PostalAddress | null {
  if (!bureauMailProviderConfigured()) return null;
  return {
    name: requiredEnv('NEW850_MAIL_FROM_NAME'),
    company: requiredEnv('NEW850_MAIL_FROM_COMPANY') || 'New850.com',
    addressLine1: requiredEnv('NEW850_MAIL_FROM_ADDRESS_LINE1'),
    addressLine2: requiredEnv('NEW850_MAIL_FROM_ADDRESS_LINE2') || undefined,
    city: requiredEnv('NEW850_MAIL_FROM_CITY'),
    state: requiredEnv('NEW850_MAIL_FROM_STATE'),
    zip: requiredEnv('NEW850_MAIL_FROM_ZIP'),
    country: 'US'
  };
}

type LobLetterResult = {
  id?: string;
  tracking_number?: string | null;
  expected_delivery_date?: string | null;
  url?: string | null;
  status?: string;
  carrier?: string;
};

function appendAddress(form: FormData, prefix: 'to' | 'from', address: PostalAddress) {
  if (address.name) form.set(`${prefix}[name]`, address.name);
  if (address.company) form.set(`${prefix}[company]`, address.company);
  form.set(`${prefix}[address_line1]`, address.addressLine1);
  if (address.addressLine2) form.set(`${prefix}[address_line2]`, address.addressLine2);
  form.set(`${prefix}[address_city]`, address.city);
  form.set(`${prefix}[address_state]`, address.state);
  form.set(`${prefix}[address_zip]`, address.zip);
  form.set(`${prefix}[address_country]`, 'US');
}

export async function sendCertifiedLetterViaLob(input: {
  bureau: CreditBureauId;
  pdf: Blob;
  filename: string;
  idempotencyKey: string;
  metadata: Record<string, string>;
}) {
  const apiKey = requiredEnv('LOB_API_KEY');
  const from = new850ReturnAddress();
  if (!apiKey || !from) throw new Error('MAIL_PROVIDER_NOT_CONFIGURED');

  const form = new FormData();
  form.set('description', `New850 ${input.bureau} consumer correspondence`);
  form.set('mail_type', 'usps_first_class');
  form.set('extra_service', requiredEnv('LOB_EXTRA_SERVICE') || 'certified');
  form.set('color', 'false');
  form.set('double_sided', 'true');
  form.set('use_type', 'operational');
  appendAddress(form, 'to', creditBureauMailingAddresses[input.bureau]);
  appendAddress(form, 'from', from);
  for (const [key, value] of Object.entries(input.metadata)) form.set(`metadata[${key}]`, value);
  form.set('file', input.pdf, input.filename);

  const response = await fetch('https://api.lob.com/v1/letters', {
    method: 'POST',
    headers: {
      authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Idempotency-Key': input.idempotencyKey,
      'Lob-Version': '2024-01-01'
    },
    body: form,
    cache: 'no-store'
  });

  const payload = await response.json().catch(() => ({})) as LobLetterResult & { error?: { message?: string }; message?: string };
  if (!response.ok) {
    throw new Error(payload.error?.message || payload.message || `LOB_SEND_FAILED_${response.status}`);
  }
  if (!payload.id) throw new Error('LOB_LETTER_ID_MISSING');
  return payload;
}
