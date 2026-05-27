import express from 'express';
import { body } from 'express-validator';
import { submitContact, getContactStats, getAllContacts } from '../controllers/contactController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// 🛡️ Rate limiting: Prevent spam (Max 5 requests per 15 minutes per IP)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    message: 'Too many contact form submissions from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Validation middleware: Sanitize and check inputs before hitting the controller
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/).withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods')
    .escape(),
  
  body('email')
    .trim()
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters')
    .escape()
];

// 🚀 Routes
router.post('/submit', contactLimiter, contactValidation, submitContact);
router.get('/stats', getContactStats);
router.get('/all', getAllContacts);

export default router;