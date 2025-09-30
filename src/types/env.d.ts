declare module '@env' {
  export const APP_ENV: string;
  export const DIR_BASE: string;
  export const DIR_VEHICLE: string;
  export const DIR_BUYER: string;
  export const DIR_REGION: string;
  export const PORT: string;
  export const DIR_CASE_OPTION: string;
  export const API_URL: string;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.png' {
  const value: any;
  export default value;
}

// FormData type for image uploads
interface FormDataValue {
  uri: string;
  type: string;
  name: string;
}

declare global {
  interface FormData {
    append(name: string, value: FormDataValue | string): void;
  }
}