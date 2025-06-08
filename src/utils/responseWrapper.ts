export function wrapResponse(
  data: any,
  statusCode = 200,
  overrides: Record<string, any> = {}
) {
  return {
    success: true,
    status: statusCode,
    ...overrides,
    data: data ?? null,
  };
}
