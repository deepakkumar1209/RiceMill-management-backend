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

    const to = new Date(toDate);

    /*
    ==================================================
    Get Inward Transactions
    ==================================================
    */

    const inwards = await Inward.find({

      issueDate: {

        $gte: from,

        $lte: to

      }

    }).sort({

      issueDate: 1

    });

    /*
    ==================================================
    Get Outward Transactions
    ==================================================
    */

    const outwards = await Outward.find({

      issueDate: {

        $gte: from,

        $lte: to

      }

    }).sort({

      issueDate: 1

    });

    const month = from.getMonth() + 1;

    const year = from.getFullYear();

    /*
    ==================================================
    Opening Balance
    ==================================================
    */

    const stockBalance = await StockBalance.findOne({

      month,

      year

    });

    const openingWeight = stockBalance
      ? Number(stockBalance.openingNetWeight || 0)
      : 0;

    const openingRiceDue = stockBalance
      ? Number(stockBalance.openingRiceDue || 0)
      : 0;

    const openingBags = stockBalance
      ? Number(stockBalance.openingBags || 0)
      : 0;

    /*
/*
==================================================
Helper Function
Rice -> Paddy Equivalent
==================================================
*/

const calculatePaddyEquivalent = (riceWeight, outturn) => {

  const rice = Number(riceWeight || 0);

  const percentage = Number(outturn || 0);

  if (percentage <= 0) {

    return 0;

  }

  return Number(

    ((rice * 100) / percentage).toFixed(2)

  );

};
/*
==================================================
Convert Inward Transactions
(Paddy Received)
==================================================
*/

const inwardTransactions = inwards.map((row) => {

  return {

    type: "INWARD",

    issueDate: row.issueDate,

    issueNumber: row.issueMemoNo,

    acknowledgeDate: row.acknowledgeDate,

    acknowledgeNumber: row.acknowledgeNumber,

    item: row.item,

    /*
    Store Paddy Weight
    */

    inwardWeight: Number(

      row.totalNetWeight || 0

    ),

    outwardWeight: 0,

    inwardBags: Number(

      row.totalNoOfBags || 0

    ),

    outwardBags: 0,

    /*
    Extra Information
    */

    paddyWeight: Number(

      row.totalNetWeight || 0

    ),

    outturn: Number(

      row.riceOutturn || 0

    )

  };

});
 /*
==================================================
Convert Outward Transactions
(Rice Issued -> Paddy Equivalent)
==================================================
*/

const outwardTransactions = await Promise.all(

  outwards.map(async (row) => {

    const item = await Item.findOne({

      itemName: row.item

    });

    const outturn = Number(

      item?.outlet || 0

    );

    const paddyEquivalent = calculatePaddyEquivalent(

      row.totalNetWeight,

      outturn

    );

    return {

      type: "OUTWARD",

      issueDate: row.issueDate,

      issueNumber: row.issueNumber,

      acknowledgeDate: row.acknowledgeDate,

      acknowledgeNumber: row.acknowledgeNumber,

      item: row.item,

      inwardWeight: 0,

      /*
      Paddy Deducted
      */

      outwardWeight: paddyEquivalent,

      inwardBags: 0,

      outwardBags: Number(

        row.totalNoOfBags || 0

      ),

      outturn

    };

  })

);

    // ==========================
    // Merge Transactions
    // ==========================

    const transactions = [
      ...inwardTransactions,
      ...outwardTransactions,
    ];

    transactions.sort(
      (a, b) =>
        new Date(a.issueDate) -
        new Date(b.issueDate)
    );

    // ==========================
    // Totals
    // ==========================
/*
==================================================
Totals
==================================================
*/

/*
--------------------------------------------------
Total Paddy Received
--------------------------------------------------
*/

const totalInwardWeight = inwards.reduce(

  (sum, row) =>

    sum +

    Number(row.totalNetWeight || 0),

  0

);

/*
--------------------------------------------------
Total Paddy Issued
(Rice -> Paddy Equivalent)
--------------------------------------------------
*/

let totalOutwardWeight = 0;

for (const row of outwards) {

  const item = await Item.findOne({

    itemName: row.item

  });

  const outturn = Number(

    item?.outlet || 0

  );

  const paddyEquivalent = calculatePaddyEquivalent(

    row.totalNetWeight,

    outturn

  );

  totalOutwardWeight += paddyEquivalent;

}

/*
--------------------------------------------------
Rice Due
--------------------------------------------------
*/

const totalInwardRiceDue = inwards.reduce(

  (sum, row) =>

    sum +

    Number(row.totalRiceDue || 0),

  0

);

const totalOutwardRiceDue = outwards.reduce(

  (sum, row) =>

    sum +

    Number(row.balanceRiceDue || 0),

  0

);

/*
--------------------------------------------------
Bags
--------------------------------------------------
*/

const totalInwardBags = inwards.reduce(

  (sum, row) =>

    sum +

    Number(row.totalNoOfBags || 0),

  0

);

const totalOutwardBags = outwards.reduce(

  (sum, row) =>

    sum +

    Number(row.totalNoOfBags || 0),

  0

);

/*
==================================================
Closing Balance
==================================================
*/

const closingWeight =

  openingWeight +

  totalInwardWeight -

  totalOutwardWeight;

const closingRiceDue =

  openingRiceDue +

  totalInwardRiceDue -

  totalOutwardRiceDue;

const closingBags =

  openingBags +

  totalInwardBags -

  totalOutwardBags;

    // ==========================
    // Response
    // ==========================
/*
==================================================
Response
==================================================
*/

res.json({

  month,

  year,

  opening: {

    weight: Number(openingWeight.toFixed(2)),

    bags: Number(openingBags.toFixed(2))

  },

  transactions,
summary: {

  totalInwardWeight: Number(totalInwardWeight.toFixed(2)),

  totalOutwardWeight: Number(totalOutwardWeight.toFixed(2)),

  totalInwardBags: Number(totalInwardBags.toFixed(2)),

  totalOutwardBags: Number(totalOutwardBags.toFixed(2)),

  closingWeight: Number(closingWeight.toFixed(2)),

  closingBags: Number(closingBags.toFixed(2))

}

});

}

catch (error) {

  res.status(500).json({

    message: error.message

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

} = req.body;

    // ============================
    // Find Current Month
    // ============================

    const stockBalance =
      await StockBalance.findOne({
        month,
        year,
      });

    if (!stockBalance) {

      return res.status(404).json({
        success: false,
        message: "Opening balance not found for this month.",
      });

    }

    // ============================
    // Already Closed?
    // ============================

    if (stockBalance.status === "CLOSED") {

      return res.status(400).json({
        success: false,
        message: "This month is already closed.",
      });

    }

    // ============================
    // Save Closing Balance
    // ============================

    stockBalance.closingNetWeight = closingWeight;

    stockBalance.closingBags = closingBags;

    stockBalance.status = "CLOSED";

    await stockBalance.save();

    // ============================
    // Calculate Next Month
    // ============================

    let nextMonth = month + 1;

    let nextYear = year;

    if (nextMonth > 12) {

      nextMonth = 1;

      nextYear++;

    }

    // ============================
    // Check Next Month Exists
    // ============================

    const nextMonthBalance =
      await StockBalance.findOne({

        month: nextMonth,

        year: nextYear,

        item: stockBalance.item,

      });

    // ============================
    // Create Next Month Opening
    // ============================

    if (!nextMonthBalance) {

      await StockBalance.create({

        month: nextMonth,

        year: nextYear,

        item: stockBalance.item,

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

    }

    // ============================
    // Response
    // ============================

    res.status(200).json({

      success: true,

      message: "Month closed successfully.",

    });

  }

  catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};