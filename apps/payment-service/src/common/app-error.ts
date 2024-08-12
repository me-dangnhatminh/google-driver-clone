/* eslint-disable @typescript-eslint/no-namespace */
import { util } from 'zod';

export const AppIssueCode = util.arrayToEnum([
  'unknown',
  'auth_invalid',
  'plan_notfound',
  'plan_invalid',
  'email_invalid',
]);

export type AppIssueCode = keyof typeof AppIssueCode;

export type IssueBase = { path: (string | number)[]; message?: string };

export type UnknownIssue = IssueBase & {
  code: typeof AppIssueCode.unknown;
};

export type PlanNotFoundIssue = IssueBase & {
  code: typeof AppIssueCode.plan_notfound;
};

export type PlanInvalidIssue = IssueBase & {
  code: typeof AppIssueCode.plan_invalid;
};

export type AppIssueOptionalMessage =
  | UnknownIssue
  | PlanNotFoundIssue
  | PlanInvalidIssue;

export type AppIssue = AppIssueOptionalMessage & {
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
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      (this as any).__proto__ = actualProto;
    }
    this.name = AppError.name;
    this.issues = issues;
  }
  static new(...issues: AppIssue[]) {
    return new AppError(structuredClone(issues));
  }

  addIssue(issue: AppIssue) {
    return new AppError([
      ...structuredClone(this.issues),
      structuredClone(issue),
    ]);
  }

  addIssues(issues: AppIssue[]) {
    return new AppError([
      ...structuredClone(this.issues),
      ...structuredClone(issues),
    ]);
  }

  throw(): never {
    throw this;
  }

  static throw(issues: AppIssue[] | AppError): never {
    if (issues instanceof AppError) return issues.throw();
    const error = new AppError(issues);
    return error.throw();
  }
}

// ===
export type stripPath<T extends object> = T extends any
  ? Omit<T, 'path'>
  : never;
export type IssueData = stripPath<AppIssueOptionalMessage> & {
  path?: (string | number)[];
  fatal?: boolean;
};
export type ErrorMapCtx = {
  defaultError: string;
  data: any;
};
export type AuthErrorMap = (
  issue: AppIssueOptionalMessage,
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
