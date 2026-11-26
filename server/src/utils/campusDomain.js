import { Campus } from '../models/index.js';

const PUBLIC_SECOND_LEVEL_PREFIXES = new Set([
  'co',
  'ac',
  'edu',
  'gov',
  'org',
  'net',
  'com',
  'nic',
  'res',
]);

/**
 * Computes candidate institutional domains from most-specific subdomain to parent domain.
 * Example: "student.gitam.edu" -> ["student.gitam.edu", "gitam.edu"]
 * Blocks matching against generic two-label public suffixes (e.g. "ac.in", "co.uk").
 */
export function getCandidateDomains(rawDomain) {
  const normalized = String(rawDomain || '').trim().toLowerCase();
  if (!normalized || !normalized.includes('.')) {
    return [];
  }

  const parts = normalized.split('.').filter(Boolean);
  if (parts.length < 2) {
    return [];
  }

  const candidates = [];
  for (let i = 0; i <= parts.length - 2; i += 1) {
    const suffixParts = parts.slice(i);
    if (
      i > 0 &&
      suffixParts.length === 2 &&
      PUBLIC_SECOND_LEVEL_PREFIXES.has(suffixParts[0]) &&
      suffixParts[1].length === 2
    ) {
      continue;
    }
    candidates.push(suffixParts.join('.'));
  }

  return candidates;
}

/**
 * Finds all campuses matching an email domain or its institutional subdomain hierarchy.
 * Exact domain matches take precedence over parent-domain matches.
 */
export async function findCampusesByDomain(rawDomain, selectFields = null) {
  const candidates = getCandidateDomains(rawDomain);
  if (candidates.length === 0) {
    return [];
  }

  let query = Campus.find({ domain: { $in: candidates } });
  if (selectFields) {
    const normalizedSelect = selectFields.includes('domain')
      ? selectFields
      : `${selectFields} domain`;
    query = query.select(normalizedSelect);
  }

  const matched = await query;
  if (matched.length === 0) {
    return [];
  }

  for (const candidate of candidates) {
    const levelMatches = matched.filter((campus) => campus.domain === candidate);
    if (levelMatches.length > 0) {
      return levelMatches;
    }
  }

  return [];
}
