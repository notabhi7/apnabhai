import { handleHealth } from '../server/aiApp';
export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  return handleHealth(req, res);
}
