// auth-server/server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Allow the Login Portal to communicate with this API
app.use(cors({ origin: 'http://localhost:3001', credentials: true })); 

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_enterprise_key_2026";

// --- THE LOGIN ROUTE ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    // 1. Verify credentials (In production, check a database and hash passwords!)
    if (username === 'admin' && password === 'tata2026') {
        
        // 2. Create the cryptographic Token (JWT)
        const token = jwt.sign(
            { id: 101, username: 'admin', role: 'commander' }, 
            JWT_SECRET, 
            { expiresIn: '8h' } // Token self-destructs in 8 hours
        );

        // 3. Send the token inside an HTTP-Only Cookie (Immune to JavaScript hackers)
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 8 * 60 * 60 * 1000 // 8 hours
        });

        return res.json({ success: true, message: "Authentication successful." });
    }

    return res.status(401).json({ success: false, message: "Invalid credentials." });
});

app.listen(4000, () => console.log('🔐 Dedicated Auth Server running on port 4000'));