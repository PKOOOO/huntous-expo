import { Redirect } from 'expo-router';

/**
 * OAuth redirect target (`huntouse://sso-callback`). The in-app browser session normally
 * captures this URL itself; if the OS opens it as a deep link instead, hand off to the splash
 * route, which routes by auth state.
 */
export default function SSOCallback() {
  return <Redirect href="/" />;
}
