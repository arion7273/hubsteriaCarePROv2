export type RegisteredFeature = {
  featureName: string;
  module: string;
  status: 'registered' | 'planned' | 'gated';
  dependencies: string[];
  version: string;
};

export function validateFeatureRegistration(feature: RegisteredFeature): string[] {
  const errors: string[] = [];

  if (!feature.featureName.trim()) {
    errors.push('Feature Name is required');
  }

  if (!feature.module.trim()) {
    errors.push('Module is required');
  }

  if (!feature.status) {
    errors.push('Status is required');
  }

  if (!feature.version.trim()) {
    errors.push('Version is required');
  }

  if (!Array.isArray(feature.dependencies)) {
    errors.push('Dependencies must be an array');
  }

  return errors;
}

export function assertFeatureRegistration(feature: RegisteredFeature): RegisteredFeature {
  const errors = validateFeatureRegistration(feature);

  if (errors.length > 0) {
    throw new Error(`Invalid feature registration: ${errors.join(', ')}`);
  }

  return feature;
}
