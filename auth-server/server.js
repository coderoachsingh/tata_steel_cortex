const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// VIP List (STRICTLY NO TRAILING SLASHES)
const allowedOrigins = [
  'https://master.di7fhjhw0ua49.amplifyapp.com', // Auth Portal
  'https://master.d3eu8k50qzo0ky.amplifyapp.com'  // Main Dashboard
];

// Bulletproof CORS Configuration
app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_enterprise_key_2026";

// --- THE LOGIN ROUTE ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === 'tata2026') {
        
        const token = jwt.sign(
            { id: 101, username: 'admin', role: 'commander' }, 
            JWT_SECRET, 
            { expiresIn: '8h' } 
        );

        // SECURE CROSS-DOMAIN COOKIE CONFIGURATION
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true, // Required for HTTPS
            sameSite: 'none', // Required for cross-domain authentication
            maxAge: 8 * 60 * 60 * 1000 
        });

        return res.json({ success: true, message: "Authentication successful.", token: token });
    }

    return res.status(401).json({ success: false, message: "Invalid credentials." });
});

app.listen(4000, () => console.log('🔐 Dedicated Auth Server running on port 4000'));

