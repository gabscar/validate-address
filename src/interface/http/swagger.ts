import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';



const swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Address Validator API',
      version: '1.0.0',
      description: 'API for validating and standardizing property addresses'
    },
    paths: {
      '/api/validate-address': {
        post: {
          summary: 'Validate an address',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    address: {
                      type: 'string',
                      description: 'The address to validate'
                    }
                  },
                  required: ['address']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Address validation result',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          isValid: { type: 'boolean' },
                          isCorrected: { type: 'boolean' },
                          isUnverifiable: { type: 'boolean' },
                          originalAddress: { type: 'string' },
                          validatedAddress: {
                            type: 'object',
                            properties: {
                              street: { type: 'string' },
                              number: { type: 'string' },
                              city: { type: 'string' },
                              state: { type: 'string' },
                              zipCode: { type: 'string' },
                              country: { type: 'string' }
                            }
                          },
                          corrections: {
                            type: 'array',
                            items: { type: 'string' }
                          },
                          confidence: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Bad request'
            },
            '500': {
              description: 'Internal server error'
            }
          }
        }
      }
    }
  };
export function setupSwagger(app: Express) {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } 