// lib/db-errors.ts
// Formats database & PostgREST errors into sanitized server logs and safe, actionable user messages.

export interface DatabaseErrorDetails {
  code: string
  message: string
  constraint: string | null
  details: string | null
}

export interface FormattedDatabaseError {
  sanitizedLog: DatabaseErrorDetails
  userMessage: string
}

/**
 * Strips secrets, passwords, tokens, API keys, and sensitive authorization strings
 * from error messages before logging or surfacing.
 */
export function sanitizeErrorMessage(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/password(=|:\s*)[^\s;,'"]+/gi, '$1***')
    .replace(/key(=|:\s*)[^\s;,'"]+/gi, '$1***')
    .replace(/token(=|:\s*)[^\s;,'"]+/gi, '$1***')
    .replace(/secret(=|:\s*)[^\s;,'"]+/gi, '$1***')
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer ***')
    .replace(/https:\/\/[^:]+:[^@]+@/gi, 'https://***:***@')
}

/**
 * Inspects any thrown error (PostgREST error object, JS Error, or unknown)
 * and formats both a sanitized server log and an actionable owner message.
 */
export function formatDatabaseError(err: unknown, entityName = 'product'): FormattedDatabaseError {
  let code = 'UNKNOWN'
  let rawMessage = ''
  let rawDetails: string | null = null
  let constraint: string | null = null

  // Supabase PostgREST error objects: { code, message, details, hint }
  if (typeof err === 'object' && err !== null) {
    const errObj = err as Record<string, unknown>
    if (typeof errObj.code === 'string') code = errObj.code
    if (typeof errObj.message === 'string') rawMessage = errObj.message
    if (typeof errObj.details === 'string') rawDetails = errObj.details
  }

  // Fallback to standard JS Error or string
  if (!rawMessage) {
    if (err instanceof Error) {
      rawMessage = err.message
      code = (err as { code?: string }).code || err.name || 'ERROR'
    } else if (typeof err === 'string') {
      rawMessage = err
    } else {
      rawMessage = 'An unexpected database error occurred.'
    }
  }

  // Extract Postgres constraint name if present
  const constraintMatch =
    rawMessage.match(/constraint "([^"]+)"/i) ||
    (rawDetails ? rawDetails.match(/constraint "([^"]+)"/i) : null)
  if (constraintMatch && constraintMatch[1]) {
    constraint = constraintMatch[1]
  }

  const sanitizedMessage = sanitizeErrorMessage(rawMessage)
  const sanitizedDetails = rawDetails ? sanitizeErrorMessage(rawDetails) : null

  // Server-side structured telemetry: NEVER log passwords or the full raw client payload
  const sanitizedLog: DatabaseErrorDetails = {
    code,
    message: sanitizedMessage,
    constraint,
    details: sanitizedDetails,
  }

  // Actionable, helpful messages for the authenticated owner
  let userMessage = `Failed to save ${entityName}.`

  // 1. Unique constraint violation (e.g. duplicate slug or duplicate key)
  if (code === '23505' || sanitizedMessage.includes('unique constraint') || constraint?.includes('slug')) {
    const slugMatch =
      (sanitizedDetails && sanitizedDetails.match(/Key \(slug\)=\(([^)]+)\)/i)) ||
      sanitizedMessage.match(/Key \(slug\)=\(([^)]+)\)/i)
    const offendingSlug = slugMatch ? ` "${slugMatch[1]}"` : ''
    userMessage = `A ${entityName} with the URL slug${offendingSlug} already exists. Please choose a different unique URL slug.`
  }
  // 2. Not-null constraint violation
  else if (code === '23502' || sanitizedMessage.includes('not-null constraint')) {
    const colMatch =
      sanitizedMessage.match(/column "([^"]+)"/i) ||
      (sanitizedDetails ? sanitizedDetails.match(/column "([^"]+)"/i) : null)
    const col = colMatch ? ` ("${colMatch[1]}")` : ''
    userMessage = `Required database field${col} was missing. Please fill in all required fields.`
  }
  // 3. Check constraint violation
  else if (code === '23514' || sanitizedMessage.includes('check constraint')) {
    userMessage = `One or more field values violate validation rules. Please verify category, status, and accent selections.`
  }
  // 4. Schema cache mismatch (e.g. PostgREST column missing)
  else if (code === 'PGRST204' || sanitizedMessage.includes('schema cache')) {
    const colMatch = sanitizedMessage.match(/Could not find the '([^']+)' column/i)
    userMessage = `Database schema mismatch: Column '${colMatch ? colMatch[1] : 'unknown'}' was not recognized in the database.`
  }
  // 5. Foreign key constraint
  else if (code === '23503' || sanitizedMessage.includes('foreign key')) {
    userMessage = `Referenced ${entityName} record does not exist or has been removed.`
  }
  // 6. Permission / RLS denial
  else if (
    code === '42501' ||
    sanitizedMessage.includes('row-level security') ||
    sanitizedMessage.includes('permission denied')
  ) {
    userMessage = `Database permission denied. Ensure your owner session is active.`
  }
  // 7. General descriptive error message
  else if (sanitizedMessage) {
    userMessage = `Database error (${code}): ${sanitizedMessage}`
  }

  return { sanitizedLog, userMessage }
}
