/**
 * Shared type definitions used across the backend.
 */

/** Standard API success response */
export interface ApiResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
}

/** Standard API error response */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/** Pagination metadata */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Paginated response */
export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

/** Dashboard stats */
export interface DashboardStats {
  totalFiles: number;
  storageUsed: string;
  storageLimit: string;
  storagePercentage: number;
  sharedFilesCount: number;
  favoritesCount: number;
}

/** Activity log actions */
export type ActivityAction =
  | "UPLOAD"
  | "DOWNLOAD"
  | "DELETE"
  | "PERMANENT_DELETE"
  | "RENAME"
  | "MOVE"
  | "COPY"
  | "SHARE"
  | "RESTORE"
  | "CREATE_FOLDER"
  | "RENAME_FOLDER"
  | "DELETE_FOLDER"
  | "RESTORE_FOLDER";

/** Entity types for activity logging */
export type EntityType = "FILE" | "FOLDER";
