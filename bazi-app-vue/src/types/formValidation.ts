/**
 * Form validation types for Element Plus forms
 */

export interface FormValidationRule {
  required?: boolean;
  message?: string;
  trigger?: string | string[];
  type?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  validator?: (
    rule: FormValidationRule,
    value: unknown,
    callback: (error?: Error) => void,
  ) => void;
}

export type FormRules = Record<string, FormValidationRule[]>;
