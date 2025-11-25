import { useMemo } from 'react';
import { Input, Select, Textarea, Button } from '../ui';
import { AdditionalRequirementType } from '../../types/jobs';

export type AdditionalRequirementDraft = {
  clientId: string;
  label: string;
  type: AdditionalRequirementType;
  isRequired: boolean;
  helperText?: string;
};

interface AdditionalRequirementsEditorProps {
  requirements: AdditionalRequirementDraft[];
  onChange: (value: AdditionalRequirementDraft[]) => void;
  maxRequirements?: number;
}

const requirementTypeOptions: { value: AdditionalRequirementType; label: string }[] = [
  { value: 'text', label: 'Text response' },
  { value: 'url', label: 'URL / Link' },
  { value: 'file', label: 'File upload' },
];

const generateClientId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const AdditionalRequirementsEditor = ({
  requirements,
  onChange,
  maxRequirements = 5,
}: AdditionalRequirementsEditorProps) => {
  const canAdd = requirements.length < maxRequirements;

  const addRequirement = () => {
    if (!canAdd) {
      return;
    }
    onChange([
      ...requirements,
      {
        clientId: generateClientId(),
        label: '',
        type: 'text',
        isRequired: true,
        helperText: '',
      },
    ]);
  };

  const updateRequirement = (
    clientId: string,
    updates: Partial<AdditionalRequirementDraft>
  ) => {
    onChange(
      requirements.map((req) =>
        req.clientId === clientId ? { ...req, ...updates } : req
      )
    );
  };

  const removeRequirement = (clientId: string) => {
    onChange(requirements.filter((req) => req.clientId !== clientId));
  };

  const requirementCounterLabel = useMemo(
    () => `${requirements.length}/${maxRequirements} requirements`,
    [requirements.length, maxRequirements]
  );

  return (
    <div className="flex flex-col gap-4 border border-fade rounded-2xl p-4 bg-white">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-semibold text-[#1C1C1C]">
            Extra application requirements
          </p>
          <span className="text-[13px] text-[#1C1C1C80]">{requirementCounterLabel}</span>
        </div>
        <p className="text-[14px] text-[#1C1C1C80]">
          Ask for portfolios, short essays, or fresh CV uploads. These questions appear on the
          graduate&apos;s application form in addition to their saved profile data.
        </p>
      </div>

      {requirements.length === 0 && (
        <div className="rounded-xl border border-dashed border-fade p-4 text-center text-[14px] text-[#1C1C1C80]">
          No custom requirements yet.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {requirements.map((requirement, index) => (
          <div
            key={requirement.clientId}
            className="rounded-2xl border border-fade p-4 flex flex-col gap-3 bg-[#FAFAFA]"
          >
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-medium text-[#1C1C1C]">
                Requirement #{index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeRequirement(requirement.clientId)}
                className="text-[13px] text-red-500 hover:text-red-600 font-medium"
              >
                Remove
              </button>
            </div>

            <Input
              label="Prompt / question"
              placeholder="e.g. Why are you a great fit for this role?"
              value={requirement.label}
              onChange={(event) =>
                updateRequirement(requirement.clientId, { label: event.target.value })
              }
              required
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                label="Response type"
                value={requirement.type}
                onChange={(event) =>
                  updateRequirement(requirement.clientId, {
                    type: event.target.value as AdditionalRequirementType,
                  })
                }
                options={requirementTypeOptions}
                required
              />
              <label className="flex items-center gap-2 text-[15px] text-[#1C1C1C] font-medium">
                <input
                  type="checkbox"
                  checked={requirement.isRequired}
                  onChange={(event) =>
                    updateRequirement(requirement.clientId, {
                      isRequired: event.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border border-fade text-button focus:ring-button"
                />
                Required
              </label>
            </div>

            <Textarea
              label="Helper text (optional)"
              placeholder="Add instructions or formatting tips"
              rows={2}
              value={requirement.helperText || ''}
              onChange={(event) =>
                updateRequirement(requirement.clientId, {
                  helperText: event.target.value,
                })
              }
            />
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={addRequirement}
        disabled={!canAdd}
        className="w-full md:w-auto"
      >
        Add requirement
      </Button>
    </div>
  );
};

export default AdditionalRequirementsEditor;

