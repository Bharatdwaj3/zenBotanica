import morgan, { token } from 'morgan';


// Colorize HTTP methods
token('colored-method', (req) => {
  const method = req.method;
  switch (method) {
    case 'GET': return `\x1b[32m${method}\x1b[0m`;     // green
    case 'POST': return `\x1b[34m${method}\x1b[0m`;    // blue
    case 'PUT': return `\x1b[33m${method}\x1b[0m`;     // yellow
    case 'DELETE': return `\x1b[31m${method}\x1b[0m`;  // red
    default: return method;
  }
});

// Colorize status codes
token('colored-status', (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // yellow
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // cyan
  if (status >= 200) return `\x1b[32m${status}\x1b[0m`; // green
  return status;
});

// Remote IP
token('remote-addr', (req) => req.ip || req.connection.remoteAddress);

// Timestamp
token('date', () => new Date().toISOString());

// User agent
token('user-agent', (req) => req.headers['user-agent'] || '-');

// Custom format
const customFormat = ':date | :remote-addr | :colored-method :url HTTP/:http-version | Status: :colored-status | :res[content-length] bytes | :response-time ms | Agent: :user-agent';

export default morgan(customFormat);
