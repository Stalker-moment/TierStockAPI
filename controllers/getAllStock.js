import express from "express";
const router = express.Router();

//import file functions
import { getAllStock, getStock, getStockPrice } from "../function/stockServices.js";

router.get("/getAllStock", async (req, res) => {
  try {
    const response = await getAllStock();

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/getStock", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).json({ message: "Code is required" });
    }

    const response = await getStock(code);

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/getStockPrice", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).json({ message: "Code is required" });
    }

    const response = await getStockPrice(code);

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
