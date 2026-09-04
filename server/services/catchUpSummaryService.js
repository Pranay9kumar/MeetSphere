export async function createCatchUpSummary({ room, requestedBy, messages = [] }) {
  return {
    room,
    requestedBy,
    provider: 'stub',
    summary: messages.length
      ? `Catch-up summary is ready for ${messages.length} recent event${messages.length === 1 ? '' : 's'}.`
      : 'No recent room events are available for a catch-up summary.',
    generatedAt: new Date().toISOString(),
    items: messages
  };
}