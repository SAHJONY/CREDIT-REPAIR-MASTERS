export const demoClientIds = new Set([
  'client_personal_demo_sahjony_gonzalez',
  'client_billing_demo_fl',
  'client_business_demo'
]);

export function isDemoClient(client: { id: string; displayName?: string }) {
  return demoClientIds.has(client.id) || Boolean(client.displayName?.startsWith('DEMO —'));
}
