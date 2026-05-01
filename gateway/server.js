require("dotenv").config();
const express = require ("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const app = express();

// Rate limiting (60 req/min)
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: "Too many requests, please try again later."
});

app.use(limiter);

// JWT Validation Middleware
const verifyToken = (req, res, next) => {
    if (req.path.startsWith("/auth")) {
        return next();
    }

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "Token required" });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        req.user = decoded;
        next();
    });
};

app.use(verifyToken);

// Routing ke auth, field, booking
app.use(
    "/auth", 
    createProxyMiddleware({
        target: "http://localhost:3001",
        changeOrigin: true,
    })
);

app.use(
    "/fields",
    createProxyMiddleware({
        target: "http://localhost:8000",
        changeOrigin: true,
    })
);

app.use(
    "/bookings",
    createProxyMiddleware({
        target: "http://localhost:3003",
        changeOrigin: true,
    })
);

// Root
app.get("/", (req, res) => {
    res.send("API Gateway Running");
});

app.listen(3000, () => {
    console.log("Gateway running on port 3000");
});