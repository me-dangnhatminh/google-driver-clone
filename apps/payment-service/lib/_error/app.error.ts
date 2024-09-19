import { util } from 'zod';

export const ErrorType = util.arrayToEnum([
  'unknown',
  'invalid_request',
  'command_rejected',
  'unauthorized',
]);

export type ErrorType = keyof typeof ErrorType;

export type ErrorBase = { message?: string };

export type UnknownError = ErrorBase & { type: typeof ErrorType.unknown };

export interface InvalidRequestError extends ErrorBase {
  type: typeof ErrorType.invalid_request;
}

// ====

export const IssueType = util.arrayToEnum([
  'unknown',
  'invalid_request',
  'command_rejected',
]);

export type IssueTypes = keyof typeof IssueType;

export type IssueBase = {
  path: (string | number)[];
  message?: string;
};

export type UnknownIssue = IssueBase & {
  type: typeof IssueType.unknown;
};

export interface InvalidRequestIssue extends IssueBase {
  type: typeof IssueType.invalid_request;
  fields: Record<string, string>;
}

export interface NotFoundIssue extends IssueBase {}

export type IssueOptionalMessage =
  | UnknownIssue
  | InvalidRequestIssue
  | NotFoundIssue;

export type AppIssue<T extends string | number = string> =
  IssueOptionalMessage & {
    code?: T;
    message: string;
  };

export class AppError<T extends string | number = string> extends Error {
  issues: AppIssue<T>[] = [];

  get errors() {
    return this.issues;
  }

  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }

  constructor(issues: AppIssue<T>[]) {
    super();
    this.name = AppError.name;
    this.issues = issues;
    Error.captureStackTrace(this, AppError);
  }

  addIssue(issue: AppIssue<T>) {
    this.issues.push(structuredClone(issue));
  }

  addIssues(issues: AppIssue<T>[]) {
    this.issues.push(...structuredClone(issues));
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
// const IssueMsgMap: Record<AppIssueType, string | Func> = {
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
