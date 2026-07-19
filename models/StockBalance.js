const mongoose = require("mongoose");

const stockBalanceSchema = new mongoose.Schema(
{
    month:{
        type:Number,
        required:true
    },

    year:{
        type:Number,
        required:true
    },

    item:{
        type:String,
        required:true
    },

    openingNetWeight:{
        type:Number,
        default:0
    },

    openingRiceDue:{
        type:Number,
        default:0
    },

    openingBags:{
        type:Number,
        default:0
    },

    inwardNetWeight:{
        type:Number,
        default:0
    },

    inwardRiceDue:{
        type:Number,
        default:0
    },

    inwardBags:{
        type:Number,
        default:0
    },

    outwardNetWeight:{
        type:Number,
        default:0
    },

    outwardRiceDue:{
        type:Number,
        default:0
    },

    outwardBags:{
        type:Number,
        default:0
    },

    closingNetWeight:{
        type:Number,
        default:0
    },

    closingRiceDue:{
        type:Number,
        default:0
    },

    closingBags:{
        type:Number,
        default:0
    },

    status:{
        type:String,
        enum:["OPEN","CLOSED"],
        default:"OPEN"
    }

},
{
    timestamps:true
});

module.exports =
mongoose.model(
"StockBalance",
stockBalanceSchema
);