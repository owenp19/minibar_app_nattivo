const express = require("express");
const router = express.Router();
const { createConsumptionWithItems } = require("../repositories/consumptionRepository");

router.post("/", async (req, res, next) => {
  try {
    const body = req.body || {};
    const roomId = Number(body.roomId);
    const note = body.note || "";
    const items = Array.isArray(body.items) ? body.items : [];

    if (!roomId) {
      return res.status(400).json({
        message: "roomId es obligatorio"
      });
    }

    const normalizedItems = items
      .map((item) => {
        const productId = Number(
          item.productId ??
            item.id ??
            item.product_id ??
            null
        );
        const quantity = Number(item.quantity ?? item.qty ?? 0);

        if (!productId || quantity <= 0) return null;

        return { productId, quantity };
      })
      .filter(Boolean);

    if (normalizedItems.length === 0) {
      return res.status(400).json({
        message: "Debes enviar al menos un producto con cantidad mayor a cero"
      });
    }

    const consumptionId = await createConsumptionWithItems(
      roomId,
      note,
      normalizedItems
    );

    return res.status(201).json({
      id: consumptionId,
      roomId,
      items: normalizedItems
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

