const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { runQuery, getRow } = require('../config/database');

// Demo login (for development/testing)
const demoLogin = async (req, res) => {
  try {
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@winecompanion.com',
      displayName: 'Demo User',
      createdAt: Date.now()
    };

    // Check if demo user exists, create if not
    const existingUser = await getRow('SELECT id FROM users WHERE id = ?', [demoUser.id]);
    if (!existingUser) {
      await runQuery(
        'INSERT INTO users (id, email, displayName, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [demoUser.id, demoUser.email, demoUser.displayName, demoUser.createdAt, demoUser.createdAt]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: demoUser.id, email: demoUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        user: demoUser,
        token
      }
    });
  } catch (error) {
    console.error('Error with demo login:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform demo login'
    });
  }
};

module.exports = {
  demoLogin
}; 