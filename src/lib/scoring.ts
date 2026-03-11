export function scoreLead(data: {
  type?: string | null;
  setting?: string | null;
  timeline?: string | null;
  photos?: string[] | null;
}): { score: number; tier: 'URGENT' | 'WARM' | 'LOW' } {
  let score = 0;

  // Job type scoring
  if (data.type === 'Custom Fabrication' || data.type === 'New Build') score += 30;
  if (data.type === 'Repair') score += 15;

  // Setting scoring
  if (data.setting === 'Commercial' || data.setting === 'Industrial') score += 25;
  if (data.setting === 'Residential') score += 10;

  // Timeline scoring
  if (data.timeline === 'ASAP') score += 25;
  if (data.timeline === 'This week') score += 20;
  if (data.timeline === 'Within 2 weeks') score += 10;
  if (data.timeline === 'No rush') score += 5;

  // Photos bonus
  if (data.photos && data.photos.length > 0) score += 10;

  // Cap at 100
  score = Math.min(score, 100);

  // Tier assignment
  let tier: 'URGENT' | 'WARM' | 'LOW';
  if (score >= 60) tier = 'URGENT';
  else if (score >= 35) tier = 'WARM';
  else tier = 'LOW';

  return { score, tier };
}
