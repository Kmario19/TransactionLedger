import type { Request, Response } from 'express';
import errorHandler from './errorHandler';
import { StatusCodes } from 'http-status-codes';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return 500 status code', () => {
    const error = new Error('Test error');

    errorHandler(error, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should include error message in development environment', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Test error');

    errorHandler(error, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Something went wrong!',
      error: 'Test error',
    });
  });

  it('should not include error message in production environment', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Test error');

    errorHandler(error, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Something went wrong!',
      error: undefined,
    });
  });
});
