require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(express.json());

// JWT Middleware
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        req.user = user;
        next();
    });
};

// Register user
app.post("/auth/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !email.includes("@")) {
        return res.status(422).json({ message: "Invalid email" });
    }

    const hashed = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashed],
        (err) => {
            if (err) {
                return res.status(400).json({ message: "Email already exists" });
            }
            res.status(201).json({ message: "User registered" });
        }
    );
});

// Login user
app.post("/auth/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err || result.length === 0) {
            return res.status(401).json({ message: "User not foud" });
        }

        const user = result[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Wrong password" });
        }

        const payload = {
            id: user.id,
            email: user.email,
        };

        // Access token (15 menit)
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });

        // Refresh token (7 hari)
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: "7d",
        });

        db.query(
            "INSERT INTO refresh_tokens (user_id, token, expiry_date) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
            [user.id, refreshToken]
        );

        res.json({
            accessToken,
            refreshToken,
        });
    });
});

// Refresh token
app.post("/auth/refresh", (req, res) => {
    const { token } = req.body || {};

    if (!token) {
        return res.status(401).json({ message: "Refresh token required"});
    }

    db.query(
        "SELECT * FROM refresh_tokens WHERE token = ?",
        [token],
        (err, result) => {
            if (err || result.length === 0) {
                return res.status(403).json({ message: "Invalid refresh token" });
            }

            const savedToken = result[0];

            if (new Date(savedToken.expiry_date) < new Date()) {
                return res.status(403).json({ message: "Refrsh token expired" });
            }

            jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
                if (err) {
                    return res.status(403).json({ message: "Invalid token" });
                }

                const payload = {
                    id: user.id,
                    email: user.email,
                };

                const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: "15m",
                });

                res.json({ accessToken });
            });
        }
    );
});

// Logout
app.post("/auth/logout", (req, res) => {
    const { token } = req.body || {};

    if (!token) {
        return res.status(400).json({ message: "Token required" });
    }

    db.query(
        "DELETE FROM refresh_tokens WHERE token = ?",
        [token],
        (err) => {
            if (err) {
                return res.status(500).json({ message: "Failed to logout" });
            }

            res.json({ message: "Logged out successfully" });
        }
    );
});

// Protected route
app.get("/protected", authMiddleware, (req, res) => {
    res.json({
        message: "Access granted",
        user: req.user,
    });
});

// Jalankan server
app.listen(process.env.PORT, () => {
    console.log("Auth running on port " + process.env.PORT);
});