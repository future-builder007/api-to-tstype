// types.ts
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface Header {
  key: string;
  value: string;
}

export interface AppState {
  url: string;
  method: HttpMethod;
  headers: Header[];
  generatedTypes: string;
  loading: boolean;
  error: string;
  copied: boolean;
}

export interface ApiRequest {
  url: string;
  method: HttpMethod;
  headers: Header[];
}

export interface ConversionResult {
  types: string;
  requestConfig?: {
    method: HttpMethod;
    headers: Record<string, string>;
  };
}

export type ExampleUrlsByMethod = Record<HttpMethod, string[]>;