// Centralized logging utility for consistent logging across the application

type LogLevel = "info" | "warn" | "error" | "debug"

interface LogData {
  [key: string]: any
}

/**
 * Structured logger for the application
 * Logs to console in development and can be extended to log to a service in production
 */
export const logger = {
  /**
   * Log an informational message
   */
  info: (message: string, data?: LogData) => {
    logMessage("info", message, data)
  },

  /**
   * Log a warning message
   */
  warn: (message: string, data?: LogData) => {
    logMessage("warn", message, data)
  },

  /**
   * Log an error message
   */
  error: (message: string, error?: Error, data?: LogData) => {
    const errorData = error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...data,
        }
      : data

    logMessage("error", message, errorData)
  },

  /**
   * Log a debug message (only in development)
   */
  debug: (message: string, data?: LogData) => {
    if (process.env.NODE_ENV === "development") {
      logMessage("debug", message, data)
    }
  },

  /**
   * Log API request details
   */
  apiRequest: (method: string, url: string, headers?: any, body?: any) => {
    logMessage("info", `API Request: ${method} ${url}`, {
      method,
      url,
      headers: sanitizeHeaders(headers),
      body: sanitizeBody(body),
    })
  },

  /**
   * Log API response details
   */
  apiResponse: (method: string, url: string, status: number, data?: any) => {
    logMessage("info", `API Response: ${method} ${url} - Status: ${status}`, {
      method,
      url,
      status,
      data: truncateData(data),
    })
  },
}

/**
 * Internal function to format and output log messages
 */
function logMessage(level: LogLevel, message: string, data?: LogData) {
  const timestamp = new Date().toISOString()
  const logObject = {
    timestamp,
    level,
    message,
    ...(data ? { data } : {}),
  }

  // In development, log with colors for better readability
  if (process.env.NODE_ENV === "development") {
    const colors = {
      info: "\x1b[36m%s\x1b[0m", // Cyan
      warn: "\x1b[33m%s\x1b[0m", // Yellow
      error: "\x1b[31m%s\x1b[0m", // Red
      debug: "\x1b[35m%s\x1b[0m", // Magenta
    }

    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
      colors[level],
      `[${timestamp}] [${level.toUpperCase()}]`,
      message,
      data ? data : "",
    )
  } else {
    // In production, log as JSON for easier parsing by logging services
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](JSON.stringify(logObject))
  }

  // Here you could also send logs to a service like Sentry, Loggly, etc.
  // if (process.env.NODE_ENV === 'production') {
  //   // Send to external logging service
  // }
}

/**
 * Sanitize headers to remove sensitive information
 */
function sanitizeHeaders(headers?: any): any {
  if (!headers) return undefined

  const sanitized = { ...headers }

  // Remove sensitive headers
  const sensitiveHeaders = ["authorization", "cookie", "set-cookie"]
  sensitiveHeaders.forEach((header) => {
    if (sanitized[header]) {
      sanitized[header] = "[REDACTED]"
    }
  })

  return sanitized
}

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeBody(body?: any): any {
  if (!body) return undefined

  // If it's a string (possibly JSON), try to parse it
  if (typeof body === "string") {
    try {
      body = JSON.parse(body)
    } catch (e) {
      // Not JSON, return as is
      return body
    }
  }

  const sanitized = { ...body }

  // Remove sensitive fields
  const sensitiveFields = ["password", "confirmPassword", "token", "secret"]
  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]"
    }
  })

  return sanitized
}

/**
 * Truncate large data objects to prevent excessive logging
 */
function truncateData(data?: any): any {
  if (!data) return undefined

  // If it's a string, truncate if too long
  if (typeof data === "string" && data.length > 1000) {
    return data.substring(0, 1000) + "... [truncated]"
  }

  // If it's an array, truncate if too many items
  if (Array.isArray(data) && data.length > 20) {
    return [...data.slice(0, 20), `... and ${data.length - 20} more items`]
  }

  // If it's an object, return as is (we could implement recursive truncation if needed)
  return data
}

