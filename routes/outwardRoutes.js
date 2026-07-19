const express=require("express");

const router=express.Router();

const{

createOutward,

getOutwards,

getOutward,

updateOutward,

deleteOutward,

}=require("../controllers/outwardController");

router.post("/",createOutward);

router.get("/",getOutwards);

router.get("/:id",getOutward);

router.put("/:id",updateOutward);

router.delete("/:id",deleteOutward);

module.exports=router;