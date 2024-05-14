import { CustomError } from "ts-custom-error";

export class ApiError extends CustomError {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string) {
    super(401, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string) {
    super(403, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(404, message);
    Object.defineProperty(this, "name", { value: "NotFoundError" });
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message);
    Object.defineProperty(this, "name", { value: "ConflictError" });
  }
}
