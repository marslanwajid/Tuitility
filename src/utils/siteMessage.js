export async function submitSiteMessage(payload) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let responsePayload = {};

  try {
    responsePayload = await response.json();
  } catch {
    responsePayload = {};
  }

  if (!response.ok) {
    throw new Error(responsePayload?.message || 'Unable to send your message right now.');
  }

  return responsePayload;
}
