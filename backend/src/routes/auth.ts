import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
<<<<<<< HEAD
import jwt from 'jsonwebtoken';
=======
import jwt, { SignOptions } from 'jsonwebtoken';
>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
import { query } from '../db/pool';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );
<<<<<<< HEAD
    const user = result.rows[0];
=======

    const user = result.rows[0];

>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
<<<<<<< HEAD
    const valid = await bcrypt.compare(password, user.password_hash);
=======

    const valid = await bcrypt.compare(password, user.password_hash);

>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
<<<<<<< HEAD
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
=======

    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // ✅ FIXED JWT typing
    const jwtSecret = process.env.JWT_SECRET || 'secret';

    const jwtOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
    };

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      },
      jwtSecret,
      jwtOptions
    );

>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        company_id: user.company_id,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/register (admin only for now)
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, first_name, last_name, role, company_id } = req.body;
<<<<<<< HEAD
    const hash = await bcrypt.hash(password, 12);
=======

    const hash = await bcrypt.hash(password, 12);

>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, company_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, company_id`,
      [email.toLowerCase(), hash, first_name, last_name, role || 'staff', company_id]
    );
<<<<<<< HEAD
=======

>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
