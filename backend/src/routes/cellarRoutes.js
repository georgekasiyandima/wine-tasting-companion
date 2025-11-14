const express = require('express');
const { body, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const cellarController = require('../controllers/cellarController');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Cellar routes
router.get('/', cellarController.getCellars);

// Cellar wines routes
router.get('/:cellarId/wines',
  param('cellarId').isUUID().withMessage('Invalid cellar ID'),
  cellarController.getCellarWines
);

router.post('/:cellarId/wines',
  [
    param('cellarId').isUUID().withMessage('Invalid cellar ID'),
    body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Wine name is required and must be between 1-200 characters'),
    body('region').trim().isLength({ min: 1, max: 100 }).withMessage('Region is required and must be between 1-100 characters'),
    body('vintage').isLength({ min: 4, max: 4 }).withMessage('Vintage must be a 4-digit year'),
    body('quantity').isInt({ min: 1, max: 1000 }).withMessage('Quantity must be between 1 and 1000'),
    body('purchasePrice').isFloat({ min: 0 }).withMessage('Purchase price must be a positive number')
  ],
  cellarController.addWineToCellar
);

router.delete('/:cellarId/wines/:wineId',
  [
    param('cellarId').isUUID().withMessage('Invalid cellar ID'),
    param('wineId').isUUID().withMessage('Invalid wine ID')
  ],
  cellarController.deleteCellarWine
);

module.exports = router; 