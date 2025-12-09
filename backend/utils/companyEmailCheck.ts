import dns from 'dns/promises';

const PUBLIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'example.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'mail.com',
  'fastmail.com',
]);

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const getDomainFromEmail = (email: string): string | null => {
  const at = email.indexOf('@');
  if (at === -1) return null;
  return email.slice(at + 1).toLowerCase();
};

export const isPublicEmailDomain = (domain: string): boolean => {
  return PUBLIC_EMAIL_DOMAINS.has(domain);
};

export const hasMxRecords = async (domain: string): Promise<boolean> => {
  try {
    const mx = await dns.resolveMx(domain);
    return Array.isArray(mx) && mx.length > 0;
  } catch (e) {
    // If DNS lookup fails we treat it as "no MX" (domain might be invalid)
    return false;
  }
};

export const isLikelyCompanyEmail = async (params: {
  email: string;
  companyWebsite?: string;
  requireMx?: boolean;
}): Promise<{ ok: boolean; reason?: string }> => {
  const { email, companyWebsite, requireMx = true } = params;
  const normalized = normalizeEmail(email);
  const domain = getDomainFromEmail(normalized);
  if (!domain) {
    return { ok: false, reason: 'Invalid email format' };
  }

  if (isPublicEmailDomain(domain)) {
    return { ok: false, reason: 'Public/free email provider detected' };
  }

  if (companyWebsite) {
    try {
      const url = companyWebsite.includes('://')
        ? new URL(companyWebsite)
        : new URL(`https://${companyWebsite}`);
      const host = url.hostname.toLowerCase();

      if (
        host !== domain &&
        !host.endsWith(`.${domain}`) &&
        !domain.endsWith(`.${host}`)
      ) {
        return {
          ok: false,
          reason: `Email domain "${domain}" does not match company website host "${host}"`,
        };
      }
    } catch (err) {
      // ignore parse errors of companyWebsite; not a blocker
    }
  }

  if (requireMx) {
    const hasMx = await hasMxRecords(domain);
    if (!hasMx) {
      return { ok: false, reason: 'No MX records found for email domain' };
    }
  }

  return { ok: true };
};
