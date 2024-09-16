/* eslint-disable @typescript-eslint/no-namespace */
import { util } from 'zod';

export const IssueCode = util.arrayToEnum([
  'unknown',
  'internal',
  'invalid_input',
  'not_found',
  'conflict',
]);

export type IssueCodes = keyof typeof IssueCode;

export type IssueBase = { path: (string | number)[]; message?: string };

export type UnknownIssue = IssueBase & {
  code: typeof IssueCode.unknown;
};

export type InternalIssue = IssueBase & {
  code: typeof IssueCode.internal;
};

export type InvalidInputIssue = IssueBase & {
  code: typeof IssueCode.invalid_input;
};

export type NotFoundIssue = IssueBase & {
  code: typeof IssueCode.not_found;
};

export type ConflictIssue = IssueBase & {
  code: typeof IssueCode.conflict;
};

export type IssueOptionalMessage =
  | UnknownIssue
  | InternalIssue
  | InvalidInputIssue
  | NotFoundIssue
  | ConflictIssue;

export type AppIssue = IssueOptionalMessage & {
  fatal?: boolean;
  message: string;
};

export class AppError extends Error {
  issues: AppIssue[] = [];

  get errors() {
    return this.issues;
  }

  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }

  constructor(issues: AppIssue[]) {
    super();
    this.name = AppError.name;
    this.issues = issues;
    Error.captureStackTrace(this, AppError);
  }

  static new(issues: AppIssue[]) {
    const error = new AppError(issues);
    Error.captureStackTrace(error, this.new);
    return error;
  }

  addIssue(issue: AppIssue) {
    const clone = structuredClone(this.issues);
    clone.concat(structuredClone(issue));
    this.issues = clone;
    const error = AppError.new(clone);
    Error.captureStackTrace(error, this.addIssue);
    return error;
  }

  addIssues(issues: AppIssue[]) {
    const clone = structuredClone(this.issues);
    clone.concat(structuredClone(issues));
    return new AppError(clone);
  }

  static throw(issues: AppIssue[] | AppError): never {
    if (issues instanceof AppError) return issues.throw();
    const error = new AppError(issues);
    Error.captureStackTrace(error, this.throw);
    return error.throw();
  }

  throw(): never {
    throw this;
  }
}

// ===
export type stripPath<T extends object> = T extends any
  ? Omit<T, 'path'>
  : never;
export type IssueData = stripPath<IssueOptionalMessage> & {
  path?: (string | number)[];
  fatal?: boolean;
};
export type ErrorMapCtx = {
  defaultError: string;
  data: any;
};
export type AuthErrorMap = (
  issue: IssueOptionalMessage,
  _ctx: ErrorMapCtx,
) => { message: string };

// type Func = (...args: string[]) => string;
// const IssueMsgMap: Record<AppIssueCode, string | Func> = {
//   unknown: 'An unknown error occurred',
//   plan_notfound: (id: string) => `Plan not found: ${id}`,
//   plan_invalid: 'Plan is invalid',
// };

// const defaultErrorMap: AuthErrorMap = (issue, _ctx) => {
//   let message = issue.message;
//   if (!message) {
//     const msg = IssueMsgMap[issue.code];
//     message = typeof msg === 'function' ? msg(...issue) : msg;
//   }
//   return { message };
// };

// let overrideErrorMap = defaultErrorMap;
// export { defaultErrorMap };
// export function setErrorMap(map: AuthErrorMap) {
//   overrideErrorMap = map;
// }

// export function getErrorMap() {
//   return overrideErrorMap;
// }

// export const makeIssue = (params: {
//   data: any;
//   path: (string | number)[];
//   errorMaps: AuthErrorMap[];
//   issueData: IssueData;
// }): AppIssue => {
//   const { data, path, errorMaps, issueData } = params;
//   const fullPath = [...path, ...(issueData.path || [])];
//   const fullIssue = {
//     ...issueData,
//     path: fullPath,
//   };

//   if (issueData.message !== undefined) {
//     return {
//       ...issueData,
//       path: fullPath,
//       message: issueData.message,
//     };
//   }

//   let errorMessage = '';
//   const maps = errorMaps
//     .filter((m) => !!m)
//     .slice()
//     .reverse() as AuthErrorMap[];
//   for (const map of maps) {
//     errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
//   }

//   return {
//     ...issueData,
//     path: fullPath,
//     message: errorMessage,
//   };
// };

// export namespace errorUtil {
//   export type ErrMessage = string | { message?: string };
//   export const errToObj = (message?: ErrMessage) =>
//     typeof message === 'string' ? { message } : message || {};
//   export const toString = (message?: ErrMessage): string | undefined =>
//     typeof message === 'string' ? message : message?.message;
// }
