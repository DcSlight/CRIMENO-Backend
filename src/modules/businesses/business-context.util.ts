import { Business } from '../../database/entities';

// Renders a Business (with its hours/cameras/policy relations loaded) into
// LLM-ready plain text. Shared by the Groq context injection
// (VideosService.selectVideo) and the AI chat assistant (AiService) so the
// two can't drift apart.
export function formatBusinessContext(business: Business): string {
  const lines: string[] = [];
  lines.push(`Store: ${business.store_name} (${business.store_type})`);
  if (business.description) lines.push(`Description: ${business.description}`);
  if (business.address || business.city) {
    lines.push(
      `Location: ${[business.address, business.city].filter(Boolean).join(', ')}`,
    );
  }

  const policy = business.business_policy;
  if (policy) {
    lines.push(
      `Sensitivity: ${policy.sensitivity_level}; scoring: ${policy.scoring_level}; interaction: ${policy.interaction_sensitivity}`,
    );
    if (policy.allowed_behaviors?.length) {
      lines.push(`Allowed behaviors: ${policy.allowed_behaviors.join(', ')}`);
    }
    if (policy.forbidden_behaviors?.length) {
      lines.push(
        `Forbidden behaviors: ${policy.forbidden_behaviors.join(', ')}`,
      );
    }
  }

  if (business.cameras?.length) {
    lines.push(
      `Surveillance cameras (${business.cameras.length}) — all video frames analyzed are captured from these cameras:`,
    );
    for (const cam of business.cameras) {
      lines.push(`  - ${cam.camera_name}: ${cam.location_description}`);
    }
  }

  return lines.join('\n');
}
