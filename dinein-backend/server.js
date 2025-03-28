require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 5000;

// PostgreSQL Connection
const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

// Middleware
app.use(cors());
app.use(express.json());

// Redirect to /dinein when the server opens
app.get("/", (req, res) => {
  res.redirect("/dinein");
});

// Dine-In Page Placeholder
app.get("/dinein", (req, res) => {
  res.send("Welcome to the Dine-In Page");
});

// ✅ Fetch all categories
app.get("/api/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch a specific category by ID
app.get("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching category:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Add a New Category
app.post("/api/categories", async (req, res) => {
  try {
    const { name, image_url } = req.body;
    if (!name || !image_url) {
      return res.status(400).json({ error: "Both category name and image_url are required" });
    }

    const result = await pool.query(
      "INSERT INTO categories (name, image_url) VALUES ($1, $2) RETURNING *",
      [name, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding category:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Delete a Category by ID
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch dishes by category
app.get("/api/categories/:id/dishes", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM dishes WHERE category_id = $1 ORDER BY id ASC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching dishes:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Add a Dish
app.post("/api/dishes", async (req, res) => {
  try {
    const { name, image_url, price, category_id } = req.body;

    if (!name || !image_url || !price || !category_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query(
      "INSERT INTO dishes (name, image_url, price, category_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, image_url, price, category_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding dish:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ---------------- CUSTOMER INFO FEATURE ---------------- */

// ✅ Add Customer (Name & Mobile Number)
app.post("/api/customers", async (req, res) => {
  try {
    const { name, mobile_number } = req.body;

    if (!name || !mobile_number) {
      return res.status(400).json({ error: "Name and Mobile Number are required" });
    }

    const result = await pool.query(
      "INSERT INTO customers (name, mobile_number) VALUES ($1, $2) RETURNING *",
      [name, mobile_number]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding customer:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch Customer by Mobile Number
app.get("/api/customers/:mobile_number", async (req, res) => {
  try {
    const { mobile_number } = req.params;
    const result = await pool.query("SELECT * FROM customers WHERE mobile_number = $1", [mobile_number]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching customer:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
