import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as jwt from 'jsonwebtoken';
import { userService } from '../services/userService';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Register
router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).trim(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      const exists = await userService.userExists(email);
      if (exists) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Create user
      const user = await userService.createUser(email, password);

      // Generate token
      const token = jwt.sign(
        { user_id: user.id, email: user.email },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user_id: user.id,
        email: user.email,
        token,
        plan: user.plan
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Login
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await userService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await userService.verifyPassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { user_id: user.id, email: user.email },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
      );

      res.json({
        user_id: user.id,
        email: user.email,
        token,
        plan: user.plan
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Logout (optional, token invalidation)
router.post('/logout', (req: Request, res: Response) => {
  // Token invalidation can be done via Redis blacklist
  res.json({ message: 'Logged out' });
});

// Refresh token
router.post('/refresh',
  body('token').exists(),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
      const newToken = jwt.sign(
        { user_id: decoded.user_id, email: decoded.email },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
      );
      res.json({ token: newToken });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
);

// Get user profile (protected)
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile (protected)
router.put('/profile', authMiddleware,
  body('plan').optional().isIn(['free', 'pro', 'business']),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = (req as any).userId;
      const { plan } = req.body;

      const updates: any = {};
      if (plan) updates.plan = plan;

      const updated = await userService.updateUserProfile(userId, updates);

      res.json(updated);
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

export default router;
