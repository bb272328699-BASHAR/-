import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'daleel-ai-super-secret-jwt-key-2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function generateToken(payload: { id: string; email: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح: يلزم تسجيل الدخول للإدارة' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة الدخول منتهية أو غير صالحة' });
  }
}

export async function recordAuditLog(userId: string | null, action: string, entityType: string, entityId?: string, details?: any, ip?: string) {
  try {
    await query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, action, entityType, entityId || null, details ? JSON.stringify(details) : null, ip || '127.0.0.1']);
  } catch (e) {
    console.error('Audit log error:', e);
  }
}
