const mongoose = require("mongoose");

const inwardSchema = new mongoose.Schema(
{
    issueDate: {
    type: Date,
    default: Date.now,
},

    issueMemoNo:String,

    acknowledgeDate: {
    type: Date,
    default: Date.now,
},

    acknowledgeNumber:String,
    

    item:String,

dpcFrom:String,

warehouse:String,

lorryNo:String,

variety:String,

netWeight:Number,

totalNetWeight:Number,

nbg:Number,

onb:Number,

ssg:Number,

swp:Number,

noOfBags:Number,

totalNoOfBags:Number,

riceOutturn:Number,


    totalRiceDue:Number

},
{
    timestamps:true
});

module.exports = mongoose.model(
"Inward",
inwardSchema
);