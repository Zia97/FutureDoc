export function hasMarketingAccess(expiresAt, now = Date.now()) {
  return typeof expiresAt === 'string' && Number.isFinite(Date.parse(expiresAt)) && Date.parse(expiresAt) > now;
}
