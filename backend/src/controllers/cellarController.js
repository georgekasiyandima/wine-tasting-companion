const { v4: uuidv4 } = require('uuid');
const { runQuery, getRow, getAll } = require('../config/database');

// Get all cellars for a user
const getCellars = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    const cellars = await getAll(
      'SELECT * FROM wine_cellars WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );

    res.json({
      success: true,
      data: cellars
    });
  } catch (error) {
    console.error('Error fetching cellars:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cellars'
    });
  }
};

// Get all wines in a cellar
const getCellarWines = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { cellarId } = req.params;

    // Verify cellar belongs to user
    const cellar = await getRow(
      'SELECT * FROM wine_cellars WHERE id = ? AND userId = ?',
      [cellarId, userId]
    );

    if (!cellar) {
      return res.status(404).json({
        success: false,
        message: 'Cellar not found'
      });
    }

    const wines = await getAll(
      'SELECT * FROM cellar_wines WHERE cellarId = ? AND userId = ? ORDER BY addedDate DESC',
      [cellarId, userId]
    );

    res.json({
      success: true,
      data: wines
    });
  } catch (error) {
    console.error('Error fetching cellar wines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cellar wines'
    });
  }
};

// Add wine to cellar
const addWineToCellar = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { cellarId } = req.params;
    const wineData = req.body;

    // Verify cellar belongs to user
    const cellar = await getRow(
      'SELECT * FROM wine_cellars WHERE id = ? AND userId = ?',
      [cellarId, userId]
    );

    if (!cellar) {
      return res.status(404).json({
        success: false,
        message: 'Cellar not found'
      });
    }

    const requiredFields = ['name', 'region', 'vintage', 'quantity', 'purchasePrice'];
    for (const field of requiredFields) {
      if (!wineData[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    const wineId = uuidv4();
    const now = Date.now();

    await runQuery(
      `INSERT INTO cellar_wines (
        id, cellarId, userId, name, region, vintage, quantity, purchasePrice, 
        currentValue, grape, winery, drinkByDate, notes, isSustainable, 
        addedDate, purchaseDate, storageLocation, agingPotential, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        wineId, cellarId, userId, wineData.name, wineData.region, wineData.vintage,
        wineData.quantity, wineData.purchasePrice, wineData.currentValue || wineData.purchasePrice,
        wineData.grape, wineData.winery, wineData.drinkByDate, wineData.notes,
        wineData.isSustainable ? 1 : 0, now, wineData.purchaseDate || now,
        wineData.storageLocation, wineData.agingPotential, now
      ]
    );

    const newWine = await getRow('SELECT * FROM cellar_wines WHERE id = ?', [wineId]);

    res.status(201).json({
      success: true,
      data: newWine
    });
  } catch (error) {
    console.error('Error adding wine to cellar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add wine to cellar'
    });
  }
};

// Delete wine from cellar
const deleteCellarWine = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { cellarId, wineId } = req.params;

    // Verify wine exists and belongs to user
    const existingWine = await getRow(
      'SELECT * FROM cellar_wines WHERE id = ? AND cellarId = ? AND userId = ?',
      [wineId, cellarId, userId]
    );

    if (!existingWine) {
      return res.status(404).json({
        success: false,
        message: 'Wine not found'
      });
    }

    await runQuery(
      'DELETE FROM cellar_wines WHERE id = ? AND cellarId = ? AND userId = ?',
      [wineId, cellarId, userId]
    );

    res.json({
      success: true,
      message: 'Wine deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cellar wine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete wine'
    });
  }
};

module.exports = {
  getCellars,
  getCellarWines,
  addWineToCellar,
  deleteCellarWine
}; 