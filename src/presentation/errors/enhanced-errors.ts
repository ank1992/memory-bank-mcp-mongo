import { z } from 'zod';

export class ValidationError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) {
    super('Validation failed');
    this.name = 'ValidationError';
  }

  toString(): string {
    const issueMessages = this.issues.map(issue => 
      `${issue.path.join('.')}: ${issue.message}`
    );
    return `ValidationError: ${issueMessages.join(', ')}`;
  }
}

export class StorageError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export class ConnectionError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'ConnectionError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}
