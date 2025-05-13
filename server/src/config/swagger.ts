import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SyncSpark API Documentation",
      version: "1.0.0",
      description:
        "API documentation for SyncSpark real-time collaboration platform",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Room: {
          type: "object",
          properties: {
            id: { type: "string" },
            code: { type: "string" },
            name: { type: "string" },
            isPublic: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            users: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["id", "code", "name", "isPublic", "createdAt", "users"],
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
          required: ["error"],
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
