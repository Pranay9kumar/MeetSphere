export async function createCatchUpSummary({ room, requestedBy, messages = [] }) {
  const keyPoints = messages.slice(-5).map((message) => `${message.senderName || 'Participant'}: ${message.content}`);
  return {
    room,
    requestedBy,
    provider: 'stub',
    summary: messages.length
      ? `Catch-up summary is ready for ${messages.length} recent event${messages.length === 1 ? '' : 's'}.`
      : 'No recent room events are available for a catch-up summary.',
    keyPoints,
    actionItems: [],
    generatedAt: new Date().toISOString(),
    items: messages
  };
}