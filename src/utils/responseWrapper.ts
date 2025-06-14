import { BaseResponse } from "../types/apiResponse";

export function wrapResponse<T>(
  data: T | null | undefined = null,
  overrides: Record<string, any> = {}
): BaseResponse | (BaseResponse & { data: T }) {
  if (data === undefined) {
    return { success: false };
  }
  return {
    success: true,
    ...overrides,
    data: data,
  };
}
