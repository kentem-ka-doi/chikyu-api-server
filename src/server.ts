// Imports for express and body-parser
import express from "express";
import bodyParser from "body-parser";
import { defineEndpoints } from "./routes";
import { swaggerDocs, swaggerUi } from "./swagger";

// Initialize express application
const app = express();
app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Initialize API endpoints
defineEndpoints(app);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Chikyu API is running on http://localhost:${PORT}`);
});
