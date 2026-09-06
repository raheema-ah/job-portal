const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'AI-Ready Job Portal & Aggregator REST API',
      version: '1.0.0',
      description:
        'Comprehensive RESTful API for Job Seekers, Employers, Admin Analytics, Job Scraping/Aggregation, and AI Resume Matching.',
      contact: {
        name: 'Job Portal Engineering Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/docs/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
