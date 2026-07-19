const StockBalance = require("../models/StockBalance");
const InventoryTransaction = require("../models/InventoryTransaction");
const Item = require("../models/Item");

/*
======================================================
GET MONTH & YEAR
======================================================
*/

function getMonthYear(date) {

    const d = new Date(date);

    return {

        month: d.getMonth() + 1,

        year: d.getFullYear()

    };

}

/*
======================================================
GET CURRENT MONTH STOCK
======================================================
*/

async function getCurrentStock(date, item) {

    const { month, year } = getMonthYear(date);

    let stock = await StockBalance.findOne({

        month,

        year,

        item

    });

    if (!stock) {

        stock = new StockBalance({

            month,

            year,

            item

        });

        await stock.save();

    }

    return stock;

}

/*
======================================================
INITIALIZE OPENING BALANCE
======================================================
*/

async function initializeOpeningBalance(stock) {

    if (

        stock.openingNetWeight > 0 ||

        stock.openingRiceDue > 0 ||

        stock.openingBags > 0

    ) {

        return;

    }

    const previousMonth = await StockBalance.findOne({

        item: stock.item,

        status: "CLOSED"

    }).sort({

        year: -1,

        month: -1

    });

    if (!previousMonth) {

        return;

    }

    stock.openingNetWeight =
        previousMonth.closingNetWeight;

    stock.openingRiceDue =
        previousMonth.closingRiceDue;

    stock.openingBags =
        previousMonth.closingBags;

    await stock.save();

}

/*
======================================================
CALCULATE PADDY REQUIRED
Rice -> Paddy Conversion
======================================================
*/

function calculatePaddyEquivalent(

    riceWeight,

    outturn

) {

    const rice = Number(riceWeight || 0);

    const percentage = Number(outturn || 0);

    if (percentage <= 0) {

        throw new Error(
            "Invalid Rice Outturn Percentage"
        );

    }

    const paddy =
        (rice * 100) / percentage;

    return Number(paddy.toFixed(2));

}
/*
======================================================
ADD INWARD
(Paddy Received)
======================================================
*/

async function addInward(inward) {

    const stock = await getCurrentStock(

        inward.issueDate,

        inward.item

    );

    await initializeOpeningBalance(stock);

    /*
    ==========================================
    Paddy Received
    ==========================================
    */

    const paddyReceived = Number(

        inward.totalNetWeight || 0

    );

    /*
    ==========================================
    Update Stock
    ==========================================
    */

    stock.inwardNetWeight += paddyReceived;

    stock.inwardRiceDue += Number(

        inward.totalRiceDue || 0

    );

    stock.inwardBags += Number(

        inward.totalNoOfBags || 0

    );

    /*
    ==========================================
    Recalculate Closing Stock
    ==========================================
    */

    stock.closingNetWeight =

        stock.openingNetWeight +

        stock.inwardNetWeight -

        stock.outwardNetWeight;

    stock.closingRiceDue =

        stock.openingRiceDue +

        stock.inwardRiceDue -

        stock.outwardRiceDue;

    stock.closingBags =

        stock.openingBags +

        stock.inwardBags -

        stock.outwardBags;

    await stock.save();

    /*
    ==========================================
    Inventory Ledger Entry
    ==========================================
    */

    await InventoryTransaction.create({

        transactionType: "INWARD",

        referenceId: inward._id,

        issueDate: inward.issueDate,

        issueNumber: inward.issueMemoNo,

        acknowledgeDate: inward.acknowledgeDate,

        acknowledgeNumber: inward.acknowledgeNumber,

        item: inward.item,

        /*
        Save Paddy Weight
        */

        netWeight: paddyReceived,

        rice: Number(

            inward.totalRiceDue || 0

        ),

        bags: Number(

            inward.totalNoOfBags || 0

        )

    });

}
/*/*
======================================================
ADD OUTWARD
(Rice Issued → Paddy Deduction)
======================================================
*/

async function addOutward(outward) {

    const stock = await getCurrentStock(

        outward.issueDate,

        outward.item

    );

    await initializeOpeningBalance(stock);

    /*
    ==========================================
    Get Item Master
    ==========================================
    */

    const item = await Item.findOne({

        itemName: outward.item

    });

    if (!item) {

        throw new Error(

            `Item '${outward.item}' not found in Item Master`

        );

    }

    /*
    ==========================================
    Rice Outturn (%)
    ==========================================
    */

    const outturn = Number(

        item.outlet || 0

    );

    if (outturn <= 0) {

        throw new Error(

            `Invalid Outturn for Item '${outward.item}'`

        );

    }

    /*
    ==========================================
    Rice Issued
    ==========================================
    */

    const riceIssued = Number(

        outward.totalNetWeight || 0

    );

    /*
    ==========================================
    Convert Rice → Paddy
    ==========================================
    */

    const paddyEquivalent = calculatePaddyEquivalent(

        riceIssued,

        outturn

    );

    /*
    ==========================================
    Update Stock
    ==========================================
    */

    stock.outwardNetWeight += paddyEquivalent;

    stock.outwardRiceDue += Number(

        outward.balanceRiceDue || 0

    );

    stock.outwardBags += Number(

        outward.totalNoOfBags || 0

    );

    /*
    ==========================================
    Recalculate Closing Stock
    ==========================================
    */

    stock.closingNetWeight =

        stock.openingNetWeight +

        stock.inwardNetWeight -

        stock.outwardNetWeight;

    stock.closingRiceDue =

        stock.openingRiceDue +

        stock.inwardRiceDue -

        stock.outwardRiceDue;

    stock.closingBags =

        stock.openingBags +

        stock.inwardBags -

        stock.outwardBags;

    await stock.save();

    /*
    ==========================================
    Inventory Ledger Entry
    ==========================================
    */

    await InventoryTransaction.create({

        transactionType: "OUTWARD",

        referenceId: outward._id,

        issueDate: outward.issueDate,

        issueNumber: outward.issueNumber,

        acknowledgeDate: outward.acknowledgeDate,

        acknowledgeNumber: outward.acknowledgeNumber,

        item: outward.item,

        /*
        Store Paddy Deducted
        */

        netWeight: paddyEquivalent,

        rice: Number(

            outward.balanceRiceDue || 0

        ),

        bags: Number(

            outward.totalNoOfBags || 0

        )

    });

}
module.exports = {

    addInward,

    addOutward

};