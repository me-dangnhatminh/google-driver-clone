type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type SpecMethod = {
  method: HttpMethod;
  fullPath: string;
  methodType?: "list" | "single";
  urlParams?: string[];
  strict?: boolean;
  apiVersion?: string;
};
type SpecMethodRequired = Required<SpecMethod>;

const defaultSpecMethod: Omit<
  SpecMethodRequired,
  "method" | "fullPath" | "urlParams" | "apiVersion"
> = {
  methodType: "single",
  strict: true,
};

export class ApiMethod {
  protected readonly spec: SpecMethod;

  private strictMode: boolean = true;

  public readonly extractedParams: string[] = [];

  private constructor(spec: SpecMethod) {
    const raw = structuredClone(Object.assign({}, defaultSpecMethod, spec));
    this.spec = raw;

    this.extractedParams = ApiMethod.extractUrlParams(this.spec.fullPath);
  }

  static make(spec: SpecMethod) {
    return new ApiMethod(spec);
  }

  static extractUrlParams(url: string) {
    const matches = url.match(/{[^}]+}/g);
    return matches ? matches.map((match) => match.slice(1, -1)) : [];
  }

  strict() {
    this.strictMode = true;
    return this;
  }

  nonStrict() {
    this.strictMode = false;
    return this;
  }

  makePath(params: Record<string, string>) {
    return this.extractedParams.reduce((acc, param) => {
      return acc.replace(`{${param}}`, params[param]);
    }, this.spec.fullPath);
  }

  missingParams(params: Record<string, string>) {
    return this.extractedParams
      .filter((param) => !params[param])
      .map((param) => param);
  }

  // ======== STATIC METHODS ========
}
