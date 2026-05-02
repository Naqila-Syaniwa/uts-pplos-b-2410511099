require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const app = express();

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60
});

app.use(limiter);

const verifyToken = (req, res, next) => {
    if (req.path.startsWith("/auth")) return next();

    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token required" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });

        req.user = decoded;
        next();
    });
};

app.use("/auth", createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true
}));

app.use("/fields", verifyToken, createProxyMiddleware({
    target: "http://localhost:8080",
    changeOrigin: true
}));

app.use("/bookings", verifyToken, createProxyMiddleware({
    target: "http://localhost:3003",
    changeOrigin: true
}));

app.listen(3000, () => {
    console.log("Gateway running on port 3000");
});