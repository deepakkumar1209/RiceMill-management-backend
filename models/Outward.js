const mongoose = require("mongoose");

const outwardSchema = new mongoose.Schema(
{
     issueDate: {
    type: Date,
    default: Date.now,
},

    issueNumber:String,

    acknowledgeDate: {
    type: Date,
    default: Date.now,
},

    acknowledgeNumber:String,
    item:String,
    

    lorryNo:String,

    variety: {
        type: String,
        default: "A",
    },

    placeOfDeposit:String,

    sampleNo:String,

    netWeight:Number,

    totalNetWeight:Number,

    balanceRiceDue:Number,

    onbg:Number,

    ssg:Number,

    swp:Number,

    usb: {
        type: Number,
        default: 0,
    },

    noOfBags:Number,

    totalNoOfBags:Number,

    balanceNoOfBags:Number,
},
{
    timestamps:true,
});

module.exports =
mongoose.model(
"Outward",
outwardSchema
);