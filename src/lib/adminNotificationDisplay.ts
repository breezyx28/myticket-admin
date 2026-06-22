export function formatNotificationKind(kind?: string): string {
  if (!kind?.trim()) return '';
  return kind
    .trim()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatRelatedEntityLabel(
  relatedEntityType?: string,
  relatedEntityId?: string,
  eventCode?: string,
): string {
  if (eventCode?.trim()) return eventCode.trim();
  if (!relatedEntityType?.trim() && !relatedEntityId?.trim()) return '';
  const type = relatedEntityType?.trim().replace(/_/g, ' ') ?? 'record';
  if (relatedEntityId?.trim()) {
    return `${type} #${relatedEntityId.trim()}`;
  }
  return type;
}
