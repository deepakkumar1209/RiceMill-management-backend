const mongoose = require("mongoose");

const inventoryTransactionSchema =
new mongoose.Schema(
{

    transactionType:{
        type:String,
        enum:["INWARD","OUTWARD"]
    },

    referenceId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },

    issueDate:Date,

    issueNumber:String,

    acknowledgeDate:Date,

    acknowledgeNumber:String,

    item:String,

    netWeight:Number,

    rice:Number,

    bags:Number

},
{
    timestamps:true
});

module.exports =
mongoose.model(
"InventoryTransaction",
inventoryTransactionSchema
);