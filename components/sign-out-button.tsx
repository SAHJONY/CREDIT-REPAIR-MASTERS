'use client';

import { authClient } from '@/lib/auth/client';

export function SignOutButton() {
  async function signOut() {
    await authClient.signOut();
    window.location.assign('/auth/sign-in');
  }
  return <button className="secondaryButton" onClick={signOut} type="button">Sign out</button>;
}
