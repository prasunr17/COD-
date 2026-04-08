import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth';
import TronWeb from 'tronweb';

const router = Router();

// Initialize Tron Web (Testnet)
const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io',
  privateKey: process.env.TRON_PRIVATE_KEY || ''
});

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  recipient_address: string;
  status: string;
  tx_hash?: string;
  created_at: Date;
}

// Mock database
const payments: Map<string, Payment> = new Map();

// Create payment link
router.post('/create',
  authMiddleware,
  body('amount').isFloat({ min: 0.1 }),
  body('currency').isIn(['USDT', 'TRX']),
  body('recipient_address').notEmpty(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency, recipient_address } = req.body;
    const user_id = (req as any).userId;

    try {
      const payment: Payment = {
        id: uuidv4(),
        user_id,
        amount,
        currency,
        recipient_address,
        status: 'pending',
        created_at: new Date()
      };

      payments.set(payment.id, payment);

      // Generate QR code URL (placeholder)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${recipient_address}`;

      res.status(201).json({
        payment_id: payment.id,
        amount,
        currency,
        recipient_address,
        status: 'pending',
        payment_link: `${process.env.FRONTEND_URL}/pay/${payment.id}`,
        qr_code: qrUrl,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    } catch (error) {
      res.status(500).json({ error: 'Payment creation failed' });
    }
  }
);

// Get payment status
router.get('/:payment_id',
  query('payment_id').notEmpty(),
  async (req: Request, res: Response) => {
    const { payment_id } = req.params;

    try {
      const payment = payments.get(payment_id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        tx_hash: payment.tx_hash,
        created_at: payment.created_at,
        confirmed: payment.status === 'confirmed'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch payment' });
    }
  }
);

// List user payments
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const user_id = (req as any).userId;
  const userPayments = Array.from(payments.values()).filter(p => p.user_id === user_id);

  res.json({
    payments: userPayments,
    total: userPayments.length
  });
});

// Webhook: On-chain payment detection
router.post('/webhook/confirm', async (req: Request, res: Response) => {
  const { payment_id, tx_hash } = req.body;

  try {
    const payment = payments.get(payment_id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify transaction on-chain (placeholder)
    payment.tx_hash = tx_hash;
    payment.status = 'confirmed';

    res.json({ message: 'Payment confirmed', tx_hash });
  } catch (error) {
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
