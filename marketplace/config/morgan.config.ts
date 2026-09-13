import morgan, { token } from 'morgan';
import type { IncomingMessage, ServerResponse } from 'http';

const colorize = (status: number): string => {
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`;
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`;
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`;
  if (status >= 200) return `\x1b[32m${status}\x1b[0m`;
  return `${status}`;
};

token('colored-status', (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
  return colorize(res.statusCode);
});

token('remote-addr', (req: IncomingMessage) => {
  return (req as any).ip || req.connection.remoteAddress;
});

export default morgan(':remote-addr :method :url :colored-status :response-time ms - :res[content-length]');
