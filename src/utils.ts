// Utility functions for general use

// Function to safely parse integers with a default fallback
export const parseInteger = (
  value: string | undefined,
  defaultValue: number = 0
): number => {
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

// Function to safely extract a string parameter from request query with a default fallback
export const getQueryString = (
  value: string | undefined,
  defaultValue: string = ""
): string => {
  return value ? value : defaultValue;
};

// Function to handle error message extraction from different types of errors
export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack ? error.stack.split("\n")[0] : error.message;
  } else if (typeof error === "string") {
    return error;
  }
  return "Error processing your request";
};

// Utility function to validate required parameters
export const validateRequiredParam = (param: any, paramName: string): void => {
  if (!param) {
    throw new Error(`${paramName} is required`);
  }
};
