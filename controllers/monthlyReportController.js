const Inward = require("../models/Inward");
const Outward = require("../models/Outward");
const Item = require("../models/Item");
const StockBalance = require("../models/StockBalance");

/*
==================================================
Monthly Report
==================================================
*/

exports.getMonthlyReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);

    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    /*
    ==================================================
    Get Inward Transactions
    ==================================================
    */
    const inwards = await Inward.find({
      issueDate: {
        $gte: from,
        $lte: to,
      },
    }).sort({
      issueDate: 1,
    });

    /*
    ==================================================
    Get Outward Transactions
    ==================================================
    */
    const outwards = await Outward.find({
      issueDate: {
        $gte: from,
        $lte: to,
      },
    }).sort({
      issueDate: 1,
    });

    const month = from.getMonth() + 1;
    const year = from.getFullYear();

    /*
    ==================================================
    Helper Function: Rice -> Paddy Equivalent
    ==================================================
    */
    const calculatePaddyEquivalent = (riceWeight, outturn) => {
      const rice = Number(riceWeight || 0);
      const percentage = Number(outturn || 0);
      if (percentage <= 0) return rice;
      return Number(((rice * 100) / percentage).toFixed(2));
    };

    /*
    ==================================================
    Convert Inward Transactions
    ==================================================
    */
    const inwardTransactions = inwards.map((row) => ({
      type: "INWARD",
      issueDate: row.issueDate,
      issueNumber: row.issueMemoNo || "-",
      acknowledgeDate: row.acknowledgeDate,
      acknowledgeNumber: row.acknowledgeNumber || "-",
      item: row.item,
      variety: row.variety || "A",
      inwardWeight: Number(row.totalNetWeight ?? row.netWeight ?? 0),
      outwardWeight: 0,
      inwardBags: Number(row.totalNoOfBags || 0),
      outwardBags: 0,
      paddyWeight: Number(row.totalNetWeight ?? row.netWeight ?? 0),
      outturn: Number(row.riceOutturn || 0),
      riceDue: Number(row.totalRiceDue || 0),
    }));

    /*
    ==================================================
    Convert Outward Transactions
    ==================================================
    */
    const outwardTransactions = await Promise.all(
      outwards.map(async (row) => {
        const item = await Item.findOne({
          itemName: row.item,
        });

        const outturn = Number(item?.outlet || 100);
        const rawWeight = Number(row.totalNetWeight ?? row.netWeight ?? 0);
        const paddyEquivalent = calculatePaddyEquivalent(
          rawWeight,
          outturn
        );

        return {
          type: "OUTWARD",
          issueDate: row.issueDate,
          issueNumber: row.issueNumber || "-",
          acknowledgeDate: row.acknowledgeDate,
          acknowledgeNumber: row.acknowledgeNumber || "-",
          item: row.item,
          variety: row.variety || "A",
          inwardWeight: 0,
          outwardWeight: paddyEquivalent,
          rawOutwardWeight: rawWeight,
          inwardBags: 0,
          outwardBags: Number(row.totalNoOfBags || 0),
          outturn,
          balanceRiceDue: Number(row.balanceRiceDue || 0),
        };
      })
    );

    /*
    ==================================================
    Merge and Sort Transactions
    ==================================================
    */
    const transactions = [
      ...inwardTransactions,
      ...outwardTransactions,
    ].sort(
      (a, b) => new Date(a.issueDate) - new Date(b.issueDate)
    );

    /*
    ==================================================
    Fetch Stock Balances for Month
    ==================================================
    */
    const stockBalances = await StockBalance.find({
      month,
      year,
    });

    /*
    ==================================================
    Build Item & Variety Wise Breakdown
    ==================================================
    */
    const itemVarietyMap = new Map();
    const getMapKey = (it, vr) => `${it}__${vr || "A"}`;

    // Strictly seed from Item Master: each valid item with Variety A, B, and C
    const allItems = await Item.find();
    const validItemNames = new Set(allItems.map((i) => i.itemName));

    for (const it of allItems) {
      for (const v of ["A", "B", "C"]) {
        const key = getMapKey(it.itemName, v);
        itemVarietyMap.set(key, {
          item: it.itemName,
          variety: v,
          openingWeight: 0,
          openingBags: 0,
          inwardCount: 0,
          inwardWeight: 0,
          inwardBags: 0,
          outwardCount: 0,
          outwardWeight: 0,
          rawOutwardWeight: 0,
          outwardBags: 0,
          closingWeight: 0,
          closingBags: 0,
        });
      }
    }

    // Populate Opening Balances from StockBalance (only for valid Item Master items)
    for (const sb of stockBalances) {
      if (!validItemNames.has(sb.item)) continue;
      const v = sb.variety || "A";
      const key = getMapKey(sb.item, v);
      if (itemVarietyMap.has(key)) {
        const entry = itemVarietyMap.get(key);
        entry.openingWeight += Number(sb.openingNetWeight || 0);
        entry.openingBags += Number(sb.openingBags || 0);
      }
    }

    // Aggregate Inwards (only for valid Item Master items)
    for (const tx of inwardTransactions) {
      if (!validItemNames.has(tx.item)) continue;
      const key = getMapKey(tx.item, tx.variety);
      if (itemVarietyMap.has(key)) {
        const entry = itemVarietyMap.get(key);
        entry.inwardCount += 1;
        entry.inwardWeight += tx.inwardWeight;
        entry.inwardBags += tx.inwardBags;
      }
    }

    // Aggregate Outwards (only for valid Item Master items)
    for (const tx of outwardTransactions) {
      if (!validItemNames.has(tx.item)) continue;
      const key = getMapKey(tx.item, tx.variety);
      if (itemVarietyMap.has(key)) {
        const entry = itemVarietyMap.get(key);
        entry.outwardCount += 1;
        entry.outwardWeight += tx.outwardWeight;
        entry.rawOutwardWeight += tx.rawOutwardWeight || tx.outwardWeight;
        entry.outwardBags += tx.outwardBags;
      }
    }

    // Calculate closing balance and round numbers for all valid Item Master items
    const breakdown = Array.from(itemVarietyMap.values())
      .filter((entry) => validItemNames.has(entry.item))
      .map((entry) => {
        entry.closingWeight = Number(
          (entry.openingWeight + entry.inwardWeight - entry.outwardWeight).toFixed(2)
        );
        entry.closingBags = Number(
          (entry.openingBags + entry.inwardBags - entry.outwardBags).toFixed(2)
        );
        entry.inwardWeight = Number(entry.inwardWeight.toFixed(2));
        entry.outwardWeight = Number(entry.outwardWeight.toFixed(2));
        entry.rawOutwardWeight = Number(entry.rawOutwardWeight.toFixed(2));
        entry.openingWeight = Number(entry.openingWeight.toFixed(2));
        entry.openingBags = Number(entry.openingBags.toFixed(2));
        return entry;
      });

    /*
    ==================================================
    Specific Bag Counts Breakdown (Inward, Outward, Net)
    ==================================================
    */
    const bagSummary = {
      nbg: { name: "NBG", label: "New B Gunny", inward: 0, outward: 0, net: 0 },
      onb: { name: "ONB / ONBG", label: "Once Used Gunny", inward: 0, outward: 0, net: 0 },
      ssg: { name: "SSG", label: "Sound Small Gunny", inward: 0, outward: 0, net: 0 },
      swp: { name: "SWP", label: "Sweepings / Patched", inward: 0, outward: 0, net: 0 },
      usb: { name: "USB", label: "Used Sound Bag", inward: 0, outward: 0, net: 0 },
      total: { name: "TOTAL BAGS", label: "Total All Bags", inward: 0, outward: 0, net: 0 },
    };

    for (const inRow of inwards) {
      bagSummary.nbg.inward += Number(inRow.nbg || 0);
      bagSummary.onb.inward += Number(inRow.onb || 0);
      bagSummary.ssg.inward += Number(inRow.ssg || 0);
      bagSummary.swp.inward += Number(inRow.swp || 0);
      bagSummary.usb.inward += Number(inRow.usb || 0);
      bagSummary.total.inward += Number(inRow.totalNoOfBags || 0);
    }

    for (const outRow of outwards) {
      bagSummary.onb.outward += Number(outRow.onbg || 0);
      bagSummary.ssg.outward += Number(outRow.ssg || 0);
      bagSummary.swp.outward += Number(outRow.swp || 0);
      bagSummary.usb.outward += Number(outRow.usb || 0);
      bagSummary.total.outward += Number(outRow.totalNoOfBags || 0);
    }

    for (const key of Object.keys(bagSummary)) {
      bagSummary[key].net = bagSummary[key].inward - bagSummary[key].outward;
    }

    /*
    ==================================================
    Variety-Wise Summary (Variety A, Variety B, Variety C, etc.)
    ==================================================
    */
    const varietyMap = new Map();
    for (const v of ["A", "B", "C"]) {
      varietyMap.set(v, {
        variety: v,
        openingWeight: 0,
        openingBags: 0,
        inwardWeight: 0,
        inwardBags: 0,
        inwardCount: 0,
        outwardWeight: 0,
        outwardBags: 0,
        outwardCount: 0,
        closingWeight: 0,
        closingBags: 0,
      });
    }

    for (const b of breakdown) {
      const v = b.variety || "A";
      if (!varietyMap.has(v)) {
        varietyMap.set(v, {
          variety: v,
          openingWeight: 0,
          openingBags: 0,
          inwardWeight: 0,
          inwardBags: 0,
          inwardCount: 0,
          outwardWeight: 0,
          outwardBags: 0,
          outwardCount: 0,
          closingWeight: 0,
          closingBags: 0,
        });
      }
      const vs = varietyMap.get(v);
      vs.openingWeight += b.openingWeight;
      vs.openingBags += b.openingBags;
      vs.inwardWeight += b.inwardWeight;
      vs.inwardBags += b.inwardBags;
      vs.inwardCount += b.inwardCount;
      vs.outwardWeight += b.outwardWeight;
      vs.outwardBags += b.outwardBags;
      vs.outwardCount += b.outwardCount;
      vs.closingWeight += b.closingWeight;
      vs.closingBags += b.closingBags;
    }

    const varietySummary = Array.from(varietyMap.values()).map((v) => ({
      ...v,
      openingWeight: Number(v.openingWeight.toFixed(2)),
      inwardWeight: Number(v.inwardWeight.toFixed(2)),
      outwardWeight: Number(v.outwardWeight.toFixed(2)),
      closingWeight: Number(v.closingWeight.toFixed(2)),
    }));

    /*
    ==================================================
    Overall Totals
    ==================================================
    */
    const totalOpeningWeight = breakdown.reduce((sum, b) => sum + b.openingWeight, 0);
    const totalOpeningBags = breakdown.reduce((sum, b) => sum + b.openingBags, 0);
    const totalInwardWeight = breakdown.reduce((sum, b) => sum + b.inwardWeight, 0);
    const totalInwardBags = breakdown.reduce((sum, b) => sum + b.inwardBags, 0);
    const totalInwardCount = breakdown.reduce((sum, b) => sum + b.inwardCount, 0);
    const totalOutwardWeight = breakdown.reduce((sum, b) => sum + b.outwardWeight, 0);
    const totalOutwardBags = breakdown.reduce((sum, b) => sum + b.outwardBags, 0);
    const totalOutwardCount = breakdown.reduce((sum, b) => sum + b.outwardCount, 0);
    const closingWeight = totalOpeningWeight + totalInwardWeight - totalOutwardWeight;
    const closingBags = totalOpeningBags + totalInwardBags - totalOutwardBags;

    res.json({
      month,
      year,
      opening: {
        weight: Number(totalOpeningWeight.toFixed(2)),
        bags: Number(totalOpeningBags.toFixed(2)),
      },
      transactions,
      breakdown,
      varietySummary,
      bagSummary,
      summary: {
        totalInwardWeight: Number(totalInwardWeight.toFixed(2)),
        totalOutwardWeight: Number(totalOutwardWeight.toFixed(2)),
        totalInwardBags: Number(totalInwardBags.toFixed(2)),
        totalOutwardBags: Number(totalOutwardBags.toFixed(2)),
        totalInwardCount,
        totalOutwardCount,
        closingWeight: Number(closingWeight.toFixed(2)),
        closingBags: Number(closingBags.toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// ===========================================
// Close Month
// ===========================================

exports.closeMonth = async (req, res) => {
  try {
    const {
      month,
      year,
      closingWeight,
      closingBags,
      breakdown,
    } = req.body;

    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }

    if (Array.isArray(breakdown) && breakdown.length > 0) {
      for (const row of breakdown) {
        let sb = await StockBalance.findOne({
          month,
          year,
          item: row.item,
          variety: row.variety || "A",
        });

        if (!sb) {
          sb = await StockBalance.findOne({
            month,
            year,
            item: row.item,
          });
        }

        if (sb) {
          sb.closingNetWeight = row.closingWeight;
          sb.closingBags = row.closingBags;
          sb.status = "CLOSED";
          await sb.save();
        }

        let nextSb = await StockBalance.findOne({
          month: nextMonth,
          year: nextYear,
          item: row.item,
          variety: row.variety || "A",
        });

        if (!nextSb) {
          await StockBalance.create({
            month: nextMonth,
            year: nextYear,
            item: row.item,
            variety: row.variety || "A",
            openingNetWeight: row.closingWeight,
            openingBags: row.closingBags,
            inwardNetWeight: 0,
            inwardBags: 0,
            outwardNetWeight: 0,
            outwardBags: 0,
            closingNetWeight: row.closingWeight,
            closingBags: row.closingBags,
            status: "OPEN",
          });
        } else {
          nextSb.openingNetWeight = row.closingWeight;
          nextSb.openingBags = row.closingBags;
          await nextSb.save();
        }
      }

      return res.status(200).json({
        success: true,
        message: "Month closed successfully for all items and varieties.",
      });
    }

    let stockBalance =
      (await StockBalance.findOne({
        month,
        year,
        status: "OPEN",
      })) ||
      (await StockBalance.findOne({
        month,
        year,
      }));

    if (!stockBalance) {
      return res.status(404).json({
        success: false,
        message: "Opening balance not found for this month.",
      });
    }

    if (stockBalance.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "This month is already closed.",
      });
    }

    stockBalance.closingNetWeight = closingWeight;
    stockBalance.closingBags = closingBags;
    stockBalance.status = "CLOSED";
    await stockBalance.save();

    const nextMonthBalance =
      await StockBalance.findOne({
        month: nextMonth,
        year: nextYear,
        item: stockBalance.item,
      });

    if (!nextMonthBalance) {
      await StockBalance.create({
        month: nextMonth,
        year: nextYear,
        item: stockBalance.item,
        variety: stockBalance.variety || "A",
        openingNetWeight: closingWeight,
        openingBags: closingBags,
        inwardNetWeight: 0,
        inwardBags: 0,
        outwardNetWeight: 0,
        outwardBags: 0,
        closingNetWeight: closingWeight,
        closingBags: closingBags,
        status: "OPEN",
      });
    } else {
      nextMonthBalance.openingNetWeight = closingWeight;
      nextMonthBalance.openingBags = closingBags;
      await nextMonthBalance.save();
    }

    res.status(200).json({
      success: true,
      message: "Month closed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};