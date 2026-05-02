require("dotenv").config();
const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(express.json());

app.post("/bookings", async (req, res) => {
    const { token, field_id } = req.body;

    try {
        // decode token langsung (lebih aman)
        const user = jwt.verify(token, process.env.JWT_SECRET);

        // get field
        const fieldRes = await axios.get(
            `${process.env.FIELD_SERVICE}/fields/${field_id}`
        );

        const field = fieldRes.data.data || fieldRes.data;

        if (!field) {
            return res.status(404).json({ message: "Field not found" });
        }

        db.query(
            "INSERT INTO booking (user_id, field_id) VALUES (?, ?)",
            [user.id, field_id],
            (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json(err);
                }

                res.status(201).json({
                    message: "Booking created",
                    booking_id: result.insertId
                });
            }
        );

    } catch (err) {
        console.log(err.message);
        return res.status(401).json({ message: "Unauthorized or service error" });
    }
});

app.get("/bookings", (req, res) => {
    db.query("SELECT * FROM booking", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

app.listen(3003, () => {
    console.log("Booking service running on port 3003");
});