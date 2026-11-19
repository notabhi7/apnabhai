import { handleConceptTest } from '../../server/aiApp';
export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }
  return handleConceptTest(req, res);
}
