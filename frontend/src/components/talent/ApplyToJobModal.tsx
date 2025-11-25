import { useEffect, useMemo, useState } from 'react';
import BaseModal from '../ui/BaseModal';
import { Input, Textarea, Button } from '../ui';
import { AdditionalRequirement, AdditionalRequirementResponse } from '../../types/jobs';

interface ApplyToJobModalProps {
  isOpen: boolean;
  job: {
    id: string;
    title?: string;
    companyName?: string;
    additionalRequirements?: AdditionalRequirement[];
  } | null;
  submitting?: boolean;
  onSubmit: (payload: {
    coverLetter: string;
    resume: string;
    additionalResponses: AdditionalRequirementResponse[];
  }) => Promise<void> | void;
  onClose: () => void;
}

type RequirementResponseState = Record<
  string,
  {
    value: string;
    fileName?: string;
  }
>;

const fileSizeLimit = 15 * 1024 * 1024; // 15MB

const ApplyToJobModal = ({
  isOpen,
  job,
  submitting = false,
  onSubmit,
  onClose,
}: ApplyToJobModalProps) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState('');
  const [responses, setResponses] = useState<RequirementResponseState>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requirements = job?.additionalRequirements ?? [];

  useEffect(() => {
    if (!isOpen) {
      setCoverLetter('');
      setResume('');
      setResponses({});
      setErrors({});
      setFormError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const requirementId = (requirement: AdditionalRequirement) =>
    requirement.id || requirement._id || '';

  const handleTextChange = (reqId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [reqId]: {
        ...prev[reqId],
        value,
      },
    }));
  };

  const handleFileChange = async (reqId: string, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      setResponses((prev) => ({
        ...prev,
        [reqId]: {
          value: '',
        },
      }));
      return;
    }

    const file = fileList[0];
    if (file.size > fileSizeLimit) {
      setErrors((prev) => ({
        ...prev,
        [reqId]: 'File is too large (15MB max).',
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setResponses((prev) => ({
        ...prev,
        [reqId]: {
          value: result,
          fileName: file.name,
        },
      }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[reqId];
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    requirements.forEach((requirement) => {
      const reqId = requirementId(requirement);
      if (!reqId) {
        return;
      }
      const response = responses[reqId];
      const value = response?.value?.trim() ?? '';

      if (!value && requirement.isRequired) {
        nextErrors[reqId] = 'This field is required.';
        return;
      }

      if (!value) {
        return;
      }

      if (requirement.type === 'url') {
        try {
          // eslint-disable-next-line no-new
          new URL(value);
        } catch (error) {
          nextErrors[reqId] = 'Enter a valid URL.';
        }
      }

      if (requirement.type === 'file' && !response?.fileName) {
        nextErrors[reqId] = 'Attach a file.';
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!job?.id) {
      return;
    }

    if (!validate()) {
      return;
    }

    const additionalResponses: AdditionalRequirementResponse[] = requirements
      .map((requirement) => {
        const reqId = requirementId(requirement);
        if (!reqId) {
          return null;
        }
        const response = responses[reqId];
        if (!response?.value) {
          return null;
        }
        return {
          requirementId: reqId,
          value: response.value,
          fileName: response.fileName,
        };
      })
      .filter((response): response is AdditionalRequirementResponse => Boolean(response));

    try {
      setIsSubmitting(true);
      setFormError(null);
      await onSubmit({
        coverLetter,
        resume,
        additionalResponses,
      });
      onClose();
    } catch (error) {
      console.error('Apply modal submission error:', error);
      setFormError('Something went wrong while submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasRequirements = requirements.length > 0;
  const submittingState = submitting || isSubmitting;

  const requirementIntro = useMemo(() => {
    if (!hasRequirements) {
      return null;
    }
    return (
      <p className="text-[14px] text-[#1C1C1C80]">
        The company asked for a few extra details. Submit them below together with your profile.
      </p>
    );
  }, [hasRequirements]);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <h2 className="text-[22px] font-semibold text-[#1C1C1C]">
            Apply to {job?.title ?? 'this role'}
          </h2>
          <p className="text-[14px] text-[#1C1C1C80]">
            {job?.companyName ?? 'Company'} will receive your profile details and the responses below.
          </p>
        </div>

        <Textarea
          label="Cover letter (optional)"
          value={coverLetter}
          onChange={(event) => setCoverLetter(event.target.value)}
          rows={4}
          placeholder="Share a short note or elevator pitch"
        />

        <Input
          label="Resume or portfolio link (optional)"
          placeholder="https://..."
          value={resume}
          onChange={(event) => setResume(event.target.value)}
        />

        {hasRequirements && (
          <div className="flex flex-col gap-4 rounded-2xl border border-fade p-4 bg-[#FAFAFA]">
            <div className="flex flex-col gap-1">
              <p className="text-[16px] font-semibold text-[#1C1C1C]">
                Additional requirements
              </p>
              {requirementIntro}
            </div>

            {requirements.map((requirement) => {
              const reqId = requirementId(requirement);
              const response = responses[reqId] || { value: '' };
              const error = errors[reqId];

              if (requirement.type === 'text') {
                return (
                  <Textarea
                    key={reqId}
                    label={`${requirement.label}${requirement.isRequired ? ' *' : ''}`}
                    placeholder={requirement.helperText || 'Type your response'}
                    rows={4}
                    value={response.value}
                    onChange={(event) => handleTextChange(reqId, event.target.value)}
                    error={error}
                    required={requirement.isRequired}
                  />
                );
              }

              if (requirement.type === 'url') {
                return (
                  <Input
                    key={reqId}
                    type="url"
                    label={`${requirement.label}${requirement.isRequired ? ' *' : ''}`}
                    placeholder={requirement.helperText || 'https://'}
                    value={response.value}
                    onChange={(event) => handleTextChange(reqId, event.target.value)}
                    required={requirement.isRequired}
                    className={error ? 'border-red-500 focus:ring-red-500' : undefined}
                  />
                );
              }

              return (
                <div key={reqId} className="flex flex-col gap-2">
                  <label className="text-[16px] font-medium text-[#1C1C1C]">
                    {requirement.label}
                    {requirement.isRequired && <span className="text-red-500"> *</span>}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={(event) => handleFileChange(reqId, event.target.files)}
                    className="w-full rounded-xl border border-dashed border-fade bg-white px-4 py-3 text-[15px] text-[#1C1C1C]"
                  />
                  {response.fileName && (
                    <p className="text-[13px] text-[#1C1C1C80]">
                      Attached: {response.fileName}
                    </p>
                  )}
                  {error && <p className="text-[13px] text-red-500">{error}</p>}
                </div>
              );
            })}
          </div>
        )}

        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[14px] text-red-600">
            {formError}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={submittingState}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto"
            disabled={submittingState}
          >
            {submittingState ? 'Submitting...' : 'Submit application'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ApplyToJobModal;

