export const apiSuccess = <T>(data: T, message = "Success") => ({
  success: true,
  message,
  data
});

export const apiError = (message: string, details?: unknown) => ({
  success: false,
  message,
  details
});
