declare const process: { env: Record<string, string | undefined> };

export type PaymentProviderId = 'square' | 'stripe' | 'paypal' | 'authorize_net' | 'adyen' | 'zelle';
export type PaymentMethodId = 'debit_card' | 'credit_card' | 'cash_app_pay' | 'paypal' | 'apple_pay' | 'google_pay' | 'zelle';

export interface PaymentProviderStatus {
  id: PaymentProviderId;
  name: string;
  configured: boolean;
  mode: 'processor' | 'wallet' | 'manual';
  methods: PaymentMethodId[];
  detail: string;
}

function configured(...names: string[]) {
  return names.every((name) => Boolean(process.env[name]?.trim()));
}

export function getPaymentProviders(): PaymentProviderStatus[] {
  return [
    { id: 'square', name: 'Square', configured: configured('SQUARE_ACCESS_TOKEN', 'SQUARE_LOCATION_ID', 'SQUARE_WEBHOOK_SIGNATURE_KEY', 'SQUARE_WEBHOOK_NOTIFICATION_URL'), mode: 'processor', methods: ['debit_card', 'credit_card', 'cash_app_pay', 'apple_pay', 'google_pay'], detail: 'Square-hosted Checkout API plus signed webhook settlement. READY requires access token, location, webhook signature key, and exact notification URL.' },
    { id: 'stripe', name: 'Stripe', configured: configured('STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET'), mode: 'processor', methods: ['debit_card', 'credit_card', 'apple_pay', 'google_pay'], detail: 'Hosted checkout plus signed webhook settlement. READY requires API, publishable, and webhook credentials.' },
    { id: 'paypal', name: 'PayPal', configured: configured('PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'), mode: 'wallet', methods: ['paypal', 'debit_card', 'credit_card'], detail: 'PayPal wallet plus eligible PayPal-hosted debit/credit card checkout.' },
    { id: 'authorize_net', name: 'Authorize.Net', configured: configured('AUTHORIZE_NET_API_LOGIN_ID', 'AUTHORIZE_NET_TRANSACTION_KEY', 'AUTHORIZE_NET_CLIENT_KEY'), mode: 'processor', methods: ['debit_card', 'credit_card'], detail: 'Backup U.S. card gateway for tokenized hosted checkout rather than raw card handling.' },
    { id: 'adyen', name: 'Adyen', configured: configured('ADYEN_API_KEY', 'ADYEN_MERCHANT_ACCOUNT', 'NEXT_PUBLIC_ADYEN_CLIENT_KEY'), mode: 'processor', methods: ['debit_card', 'credit_card', 'apple_pay', 'google_pay'], detail: 'Enterprise-scale optional processor kept plug-in ready; not required for launch.' },
    { id: 'zelle', name: 'Zelle', configured: configured('ZELLE_RECIPIENT', 'ZELLE_DISPLAY_NAME'), mode: 'manual', methods: ['zelle'], detail: 'Manual bank-payment rail. Customer-reported payments require staff reconciliation before an invoice is marked paid.' }
  ];
}

export function availablePaymentMethods() {
  const methods = new Set<PaymentMethodId>();
  for (const provider of getPaymentProviders()) if (provider.configured) for (const method of provider.methods) methods.add(method);
  return [...methods];
}

export function paymentProviderSummary() {
  const providers = getPaymentProviders();
  return { configured: providers.filter((provider) => provider.configured).length, total: providers.length, providers, methods: availablePaymentMethods() };
}
