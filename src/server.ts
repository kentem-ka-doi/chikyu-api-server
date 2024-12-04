// Express, Chikyu API integration, and session handler imports
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import Chikyu from "chikyu-sdk";
import { getSession } from "./session";

// Initialize express application
const app = express();
app.use(bodyParser.json());

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
const createHandler = (
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
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack ? error.stack.split("\n")[0] : error.message;
  } else if (typeof error === "string") {
    return error;
  }
  return "Error processing your request";
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

const getListParams = (req: Request) => {
  const items_per_page = parseInt(req.query.items_per_page as string, 10) || 10;
  const page_index = parseInt(req.query.page as string, 10) || 0;
  return { items_per_page, page_index };
};

const createParams = (req: Request) => ({ fields: { ...req.body } });

// Define endpoints using createHandler to avoid duplication
const defineEndpoints = () => {
  app.get(
    "/api/v1/companies/:kentem_id",
    createHandler("companies", "single", getKeySearchParams("kentem_id"), true)
  );
  app.get(
    "/api/v1/companies/shokon-code/:shokon_code",
    createHandler(
      "companies",
      "single",
      getKeySearchParams("shokon_code"),
      true
    )
  );
  app.get(
    "/api/v1/companies",
    createHandler("companies", "list", getListParams)
  );
  app.post(
    "/api/v1/companies",
    createHandler("companies", "create", createParams)
  );

  app.get(
    "/api/v1/business-discussions",
    createHandler("business_discussions", "list", getListParams)
  );
  app.post(
    "/api/v1/business-discussions",
    createHandler("business_discussions", "create", createParams)
  );
};

// Initialize API endpoints
defineEndpoints();

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Chikyu API is running on http://localhost:${PORT}`);
});
