export function wrapResponse<T>(
  data: T,
  statusCode = 200,
  overrides: Record<string, any> = {}
): BaseResponse & { data: T } {
  return {
    success: true,
    status: statusCode,
    ...overrides,
    data: data,
  };
}
