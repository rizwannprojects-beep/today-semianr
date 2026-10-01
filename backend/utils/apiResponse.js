/**
 * Standardized API Response format
 * Every response conforms to:
 * {
 *   "success": boolean,
 *   "message": string,
 *   "data": object | array | null,
 *   "meta": object | null,
 *   "error": null
 * }
 */
export class ApiResponse {
  static success(res, { statusCode = 200, message = 'Success', data = null, meta = null }) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
      error: null
    });
  }

  static created(res, { message = 'Resource created successfully', data = null, meta = null }) {
    return ApiResponse.success(res, { statusCode: 201, message, data, meta });
  }

  static paginated(res, { message = 'Data retrieved successfully', data = [], pagination = {} }) {
    return ApiResponse.success(res, {
      statusCode: 200,
      message,
      data,
      meta: {
        pagination: {
          page: Number(pagination.page) || 1,
          limit: Number(pagination.limit) || 10,
          totalItems: Number(pagination.totalItems) || data.length,
          totalPages: Number(pagination.totalPages) || Math.ceil((pagination.totalItems || data.length) / (pagination.limit || 10))
        }
      }
    });
  }
}

export default ApiResponse;
