// Imports for request handlers and parameter processing functions
import { Application } from "express";
import {
  createHandler,
  getListParams,
  createParams,
  updateParams,
  generateSingleHandler,
  patchByFieldHandler,
} from "./handlers";

// Define API endpoints for the express application
export const defineEndpoints = (app: Application): void => {
  const companiesHandler = createHandler("companies");
  const businessDiscussionsHandler = createHandler("business_discussions");

  // Define routes for companies
  app.get(
    "/api/v1/companies/:kentem_id",
    generateSingleHandler(companiesHandler, "kentem_id")
  );
  app.get(
    "/api/v1/companies/shokon-code/:shokon_code",
    generateSingleHandler(companiesHandler, "shokon_code")
  );
  app.get("/api/v1/companies", companiesHandler("list")(getListParams));
  app.post("/api/v1/companies", companiesHandler("create")(createParams));
  app.patch(
    "/api/v1/companies/id/:key",
    companiesHandler("save")(updateParams("key"))
  );
  app.patch(
    "/api/v1/companies/:kentem_id",
    patchByFieldHandler("companies", "kentem_id")
  );
  app.patch(
    "/api/v1/companies/shokon-code/:shokon_code",
    patchByFieldHandler("companies", "shokon_code")
  );

  // Define routes for business discussions
  app.get(
    "/api/v1/business-discussions",
    businessDiscussionsHandler("list")(getListParams)
  );
  app.post(
    "/api/v1/business-discussions",
    businessDiscussionsHandler("create")(createParams)
  );
};
