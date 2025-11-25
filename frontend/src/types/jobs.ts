export type AdditionalRequirementType = 'text' | 'url' | 'file';

export interface AdditionalRequirement {
  id?: string;
  _id?: string;
  label: string;
  type: AdditionalRequirementType;
  isRequired: boolean;
  helperText?: string;
}

export interface AdditionalRequirementResponse {
  requirementId: string;
  value: string;
  fileName?: string;
}

