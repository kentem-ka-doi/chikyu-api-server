import { Request, Response } from "express";
import Chikyu from "chikyu-sdk";
import { getSession } from "./session";

// Helper function to respond with error
const respondWithError = (res: Response, status: number, error: string) => {
  res.status(status).json({ error });
};

// Helper function to handle Chikyu API calls
const handleChikyuApiCall = async (
  collectionName: string,
  method: string,
  params: Record<string, any>,
  isAsync: boolean = false
) => {
  try {
    await getSession();
    return await Chikyu.secure.invoke(`/entity/${collectionName}/${method}`, {
      ...params,
      is_async: isAsync,
    });
  } catch (error) {
    console.error(
      `Error in Chikyu API (${method} - ${collectionName}):`,
      error
    );
    throw error;
  }
};

// Error message extractor
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack ? error.stack.split("\n")[0] : error.message;
  } else if (typeof error === "string") {
    return error;
  }
  return "Error processing your request";
};

// Parameter generators
export const createParams = (req: Request) => {
  return { fields: { ...req.body } };
};

export const updateParams = (key: string) => (req: Request) => {
  return { key, fields: { ...req.body } };
};

export const getListParams = (req: Request) => {
  const items_per_page = parseInt(req.query.items_per_page as string, 10) || 10;
  const page_index = parseInt(req.query.page as string, 10) || 0;
  return { items_per_page, page_index };
};

// Key search parameter generator
const getKeySearchParams = (fieldName: string) => (req: Request) => {
  const key = req.params[fieldName];
  if (!key) throw new Error(`${fieldName} parameter is required`);
  return {
    key,
    key_search_option: {
      input_field_name: fieldName,
      input_method: "by_field_value",
    },
  };
};

// DRY PATCH handler
export const patchByFieldHandler =
  (collectionName: string, idFieldName: string) =>
  async (req: Request, res: Response) => {
    try {
      // Fetch internal ID
      const searchParams = getKeySearchParams(idFieldName)(req);
      const fetchResult = await handleChikyuApiCall(
        collectionName,
        "single",
        searchParams
      );
      const key = fetchResult?._id;

      if (!key) {
        respondWithError(
          res,
          404,
          `${collectionName} not found for the provided ${idFieldName}`
        );
        return;
      }

      // Perform PATCH operation
      const updateParamsObj = updateParams(key)(req);
      const updateResult = await handleChikyuApiCall(
        collectionName,
        "save",
        updateParamsObj
      );
      res.json(updateResult);
    } catch (error) {
      console.error(error);
      respondWithError(res, 500, getErrorMessage(error));
    }
  };

// Generic API handler generator
export const createHandler =
  (collectionName: string) =>
  (method: string) =>
  (paramHandler: (req: Request) => Record<string, any>) =>
  async (req: Request, res: Response) => {
    try {
      const params = paramHandler(req);
      const isAsync = req.method === "GET";
      const result = await handleChikyuApiCall(
        collectionName,
        method,
        params,
        isAsync
      );
      res.json(result);
    } catch (error) {
      console.error(error);
      respondWithError(res, 500, getErrorMessage(error));
    }
  };

// Generic function to generate single GET handler
export const generateSingleHandler = (handler: any, key: string) =>
  handler("single")(getKeySearchParams(key));
