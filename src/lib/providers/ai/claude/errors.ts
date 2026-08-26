/**
 * Typed domain errors for Claude AI Provider.
 * Safely wraps Anthropic SDK errors without exposing credentials or internal secrets.
 */

export class ClaudeError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;

  constructor(message: string, code: string = 'CLAUDE_ERROR', statusCode?: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ClaudeAuthenticationError extends ClaudeError {
  constructor(message: string = 'Anthropic authentication failed. Please verify your ANTHROPIC_API_KEY.') {
    super(message, 'CLAUDE_AUTHENTICATION_ERROR', 401);
  }
}

export class ClaudeModelNotFoundError extends ClaudeError {
  constructor(model: string, message?: string) {
    super(
      message || `The requested Claude model "${model}" is not available or not supported on this account.`,
      'CLAUDE_MODEL_NOT_FOUND',
      404
    );
  }
}

export class ClaudeRateLimitError extends ClaudeError {
  constructor(message: string = 'Anthropic rate limit exceeded. Please retry after a brief moment.') {
    super(message, 'CLAUDE_RATE_LIMIT_EXCEEDED', 429);
  }
}

export class ClaudeOverloadedError extends ClaudeError {
  constructor(message: string = 'Anthropic servers are currently overloaded. Please retry.') {
    super(message, 'CLAUDE_SERVER_OVERLOADED', 529);
  }
}

export class ClaudeInvalidRequestError extends ClaudeError {
  constructor(message: string) {
    super(message, 'CLAUDE_INVALID_REQUEST', 400);
  }
}

export class ClaudeStructuredOutputError extends ClaudeError {
  public readonly rawText?: string;

  constructor(message: string, rawText?: string) {
    super(message, 'CLAUDE_STRUCTURED_OUTPUT_ERROR', 422);
    this.rawText = rawText;
  }
}

export class ClaudeNetworkError extends ClaudeError {
  constructor(message: string = 'Failed to connect to Anthropic API network.') {
    super(message, 'CLAUDE_NETWORK_ERROR', 503);
  }
}

/**
 * Maps Anthropic SDK errors to safe domain errors without leaking secrets.
 */
export function mapAnthropicError(error: any, model?: string): ClaudeError {
  if (error instanceof ClaudeError) {
    return error;
  }

  const status = error?.status || error?.statusCode;
  const message = error?.message || 'An error occurred during Anthropic Claude execution';

  if (status === 401 || /authentication|api[- ]key|unauthorized/i.test(message)) {
    return new ClaudeAuthenticationError();
  }

  if (status === 404 || /not[- ]found|model/i.test(message)) {
    return new ClaudeModelNotFoundError(model || 'unknown', message);
  }

  if (status === 429 || /rate[- ]limit/i.test(message)) {
    return new ClaudeRateLimitError(message);
  }

  if (status === 529 || /overloaded/i.test(message)) {
    return new ClaudeOverloadedError(message);
  }

  if (status === 400) {
    return new ClaudeInvalidRequestError(message);
  }

  if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|fetch failed/i.test(message)) {
    return new ClaudeNetworkError(message);
  }

  return new ClaudeError(message, 'CLAUDE_UNKNOWN_ERROR', status);
}
