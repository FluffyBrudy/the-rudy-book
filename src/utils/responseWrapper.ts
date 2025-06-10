import { BaseResponse } from "../types/apiResponse";

export function wrapResponse<T>(
  data: T,
  overrides: Record<string, any> = {}
): BaseResponse & { data: T } {
  return {
    success: true,
    ...overrides,
    data: data,
  };
}
