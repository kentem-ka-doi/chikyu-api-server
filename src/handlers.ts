// Imports for Chikyu API and session management
import { Request, Response } from "express";
import Chikyu from "chikyu-sdk";
import { getSession } from "./session";

// Function to fetch data from Chikyu
export const fetchData = async (
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
export const createHandler = (
  collectionName: string,
  method: string,
  paramHandler: (req: Request) => Record<string, any>,
  is_async: boolean = false
) => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const params = paramHandler(req);
      const result = await fetchData(collectionName, method, params, is_async);
      res.json(result);
    } catch (error) {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage });
    }
  };
};

// Function to get error message from an error object
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack ? error.stack.split("\n")[0] : error.message;
  } else if (typeof error === "string") {
    return error;
  }
  return "Error processing your request";
};

// Parameter processing functions
export const getKeySearchParams = (fieldName: string) => (req: Request) => {
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

export const getListParams = (req: Request) => {
  const items_per_page = parseInt(req.query.items_per_page as string, 10) || 10;
  const page_index = parseInt(req.query.page as string, 10) || 0;
  return { items_per_page, page_index };
};

export const createParams = (req: Request) => ({ fields: { ...req.body } });