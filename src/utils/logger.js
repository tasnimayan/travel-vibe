const fs = require('fs').promises;
const { format } = require('date-fns');
const path = require('path');

const logger = async (err, req = null) => {
  try {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'error-logs.txt');

    // Ensure logs directory exists
    await fs.mkdir(logDir, { recursive: true });

    // Build detailed error information
    const errorDetails = {
      timestamp,
      errorName: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode || 500,
      
      // Request details (if available)
      request: req ? {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      } : null,

      // Additional context
      environment: process.env.NODE_ENV,
      processInfo: {
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
      }
    };

    const errorLog = `\n[${timestamp}] ERROR REPORT\n${'-'.repeat(50)}\n${JSON.stringify(errorDetails, null, 2)}\n${'-'.repeat(50)}\n`;
    
    // Append to log file
    await fs.appendFile(logFile, errorLog);
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorDetails);
    }

    return errorDetails;
  } catch (writeErr) {
    console.error('Error writing to log file:', writeErr);
    // Fallback to console logging if file writing fails
    console.error('Original error:', err);
  }
};

module.exports = { logger };