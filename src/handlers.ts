// Imports for Chikyu API and session management
import { Request, Response } from "express";
import Chikyu from "chikyu-sdk";
import { getSession } from "./session";

// PATCH handler for updating by a specific field
export const patchByFieldHandler =
  (
    collectionName: string, // API のコレクション名
    idFieldName: string // ID を取得するためのフィールド名 (例: kentem_id, shokon_code)
  ) =>
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Step 1: Fetch internal ID using idFieldName
      const fieldValue = req.params[idFieldName];
      if (!fieldValue) {
        res.status(400).json({ error: `${idFieldName} is required` });
        return;
      }

      const searchParams = getKeySearchParams(idFieldName)(req);
      const fetchResult = await fetchData(
        collectionName,
        "single",
        searchParams
      );

      const key = fetchResult?._id; // 内部 ID を取得
      if (!key) {
        res.status(404).json({
          error: `${collectionName} not found for the provided ${idFieldName}`,
        });
        return;
      }

      // Step 2: Perform PATCH operation using the retrieved ID
      const buildUpdateParams = updateParams(key);
      const finalUpdateParams = buildUpdateParams(req);
      const updateResult = await fetchData(
        collectionName,
        "save",
        finalUpdateParams
      );

      // Respond with the updated result
      res.json(updateResult);
    } catch (error) {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage });
    }
  };

// Parameter processing functions
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

// Function to get error message from an error object
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack ? error.stack.split("\n")[0] : error.message;
  } else if (typeof error === "string") {
    return error;
  }
  return "Error processing your request";
};

// Function to fetch data from Chikyu
const fetchData = async (
  collectionName: string,
  method: string,
  params: Record<string, any>,
  is_async: boolean = false
) => {
  try {
    await getSession();
    return await Chikyu.secure.invoke(`/entity/${collectionName}/${method}`, {
      ...params,
      is_async,
    });
  } catch (error) {
    console.error(`Error in fetchData (${collectionName}):`, error);
    throw error;
  }
};

// Function to create an API handler
export const createHandler =
  (collectionName: string) =>
  (method: string) =>
  (paramHandler: (req: Request) => Record<string, any>) =>
  async (req: Request, res: Response): Promise<void> => {
    try {
      const params = paramHandler(req);
      const is_async = req.method === "GET";
      const result = await fetchData(collectionName, method, params, is_async);
      res.json(result);
    } catch (error) {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage });
    }
  };

export const getListParams = (req: Request) => {
  const items_per_page = parseInt(req.query.items_per_page as string, 10) || 10;
  const page_index = parseInt(req.query.page as string, 10) || 0;
  return { items_per_page, page_index };
};

export const createParams = (req: Request) => ({ fields: { ...req.body } });

export const updateParams = (key: string) => (req: Request) => ({
  key,
  fields: { ...req.body },
});

// Generic function to generate single GET handler
export const generateSingleHandler = (handler: any, key: string) =>
  handler("single")(getKeySearchParams(key));
