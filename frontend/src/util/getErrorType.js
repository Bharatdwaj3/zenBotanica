// Classifies an axios error into which error screen should be shown.
// Returns one of: 'notFound' | 'forbidden' | 'network' | 'server' | null (no error)
export function getErrorType(err) {
  if (!err) return null;
  if (!err.response) return 'network'; // timeout, offline, connection refused
  const status = err.response.status;
  if (status === 404) return 'notFound';
  if (status === 403) return 'forbidden';
  if (status >= 500) return 'server';
  return null; // other errors (400, 409 etc.) stay as inline form messages, not full screens
}
