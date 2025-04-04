import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import schemaValidator from './schemaValidator';

describe('Schema Validator Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should validate body successfully', async () => {
    const schema = {
      body: z.object({
        name: z.string(),
        age: z.number(),
      }),
    };

    mockRequest.body = { name: 'John', age: 30 };

    await schemaValidator(schema)(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  it('should validate params successfully', async () => {
    const schema = {
      params: z.object({
        id: z.string(),
      }),
    };

    mockRequest.params = { id: '123' };

    await schemaValidator(schema)(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  it('should validate query successfully', async () => {
    const schema = {
      query: z.object({
        page: z.string().optional(),
      }),
    };

    mockRequest.query = { page: '1' };

    await schemaValidator(schema)(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return error when body is required but missing', async () => {
    const schema = {
      body: z.object({
        name: z.string(),
      }),
    };

    mockRequest.body = undefined;

    await schemaValidator(schema)(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Validation Error',
      message: 'Request body is required',
    });
  });

  it('should return validation error for invalid body', async () => {
    const schema = {
      body: z.object({
        age: z.number(),
      }),
    };

    mockRequest.body = { age: 'invalid' };

    await schemaValidator(schema)(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Validation Error',
      details: expect.arrayContaining([
        expect.objectContaining({
          path: expect.any(String),
          message: expect.any(String),
        }),
      ]),
    });
  });

  it('should validate multiple schema parts together', async () => {
    const schema = {
      body: z.object({
        name: z.string(),
      }),
      params: z.object({
        id: z.string(),
      }),
      query: z.object({
        version: z.string().optional(),
      }),
    };

    mockRequest.body = { name: 'John' };
    mockRequest.params = { id: '123' };
    mockRequest.query = { version: 'v1' };

    await schemaValidator(schema)(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return error when params are required but empty', async () => {
    const schema = {
      params: z.object({
        id: z.string(),
      }),
    };

    mockRequest.params = {};

    await schemaValidator(schema)(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Validation Error',
      message: 'URL parameters are required',
    });
  });

  it('should handle optional query parameters', async () => {
    const schema = {
      query: z.object({
        search: z.string().optional(),
        page: z.number().optional(),
      }),
    };

    mockRequest.query = undefined;

    await schemaValidator(schema)(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  it('should throw internal error for non-Zod errors', async () => {
    const schema = {
      body: z.object({
        name: z.string(),
      }),
    };

    const error = new Error('Internal error');
    mockRequest.body = {};
    jest.spyOn(schema.body, 'parseAsync').mockRejectedValue(error);

    await expect(
      schemaValidator(schema)(mockRequest as Request, mockResponse as Response, nextFunction)
    ).rejects.toThrow(error);
  });
});
