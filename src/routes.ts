// Imports for request handlers and parameter processing functions
import { Application } from "express";
import {
  createHandler,
  getKeySearchParams,
  getListParams,
  createParams,
} from "./handlers";

// Define API endpoints for the express application
export const defineEndpoints = (app: Application): void => {
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
