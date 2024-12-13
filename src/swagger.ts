import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chikyu API Server",
      version: "1.0.0",
      description: "API documentation for Chikyu API Server",
    },
    components: {
      schemas: {
        Company: {
          type: "object",
          properties: {
            _id: {
              type: "integer",
              description: "企業ID",
            },
            company_name: {
              type: "string",
              description: "企業名",
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "サーバーエラー (不正なユーザー)",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description: "エラーメッセージ",
                  },
                },
                example: {
                  error: "Error: 不正なユーザーです",
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes.ts"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

export { swaggerDocs, swaggerUi };
