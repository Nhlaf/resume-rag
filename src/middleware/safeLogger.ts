/**
 * Safe logging utilities (Phase 16)
 * Ensures sensitive data is never logged
 */

/**
 * Sanitize log entry to remove sensitive data
 */
export function sanitizeLogEntry(entry: any): any {
  const sanitized = { ...entry };

  // Remove or redact sensitive fields
  const sensitiveKeys = [
    'password',
    'apiKey',
    'api_key',
    'secret',
    'token',
    'authorization',
    'mistralApiKey',
    'groqApiKey',
    'MISTRAL_API_KEY',
    'GROQ_API_KEY',
  ];

  // Recursively sanitize object
  function redactSensitive(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(redactSensitive);
    }

    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk.toLowerCase()))) {
        sanitizedObj[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitizedObj[key] = redactSensitive(value);
      } else {
        sanitizedObj[key] = value;
      }
    }
    return sanitizedObj;
  }

  return redactSensitive(sanitized);
}

/**
 * Truncate large text fields to prevent log bloat
 */
export function truncateLargeFields(entry: any, maxLength: number = 200): any {
  const truncated = { ...entry };

  // Fields that should be truncated if too large
  const truncatableFields = ['rawText', 'snippet', 'text', 'content', 'summary'];

  function truncateFields(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(truncateFields);
    }

    const truncatedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (truncatableFields.includes(key) && typeof value === 'string' && value.length > maxLength) {
        truncatedObj[key] = value.substring(0, maxLength) + '... [truncated]';
      } else if (typeof value === 'object') {
        truncatedObj[key] = truncateFields(value);
      } else {
        truncatedObj[key] = value;
      }
    }
    return truncatedObj;
  }

  return truncateFields(truncated);
}

/**
 * Create a safe log entry suitable for production
 */
export function createSafeLogEntry(entry: any): any {
  let safe = sanitizeLogEntry(entry);
  safe = truncateLargeFields(safe);
  return safe;
}
