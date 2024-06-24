//routes/invoices.js
const express=require('express');
const router=new express.Router();
const client=require('../db');

//GET Invoices
router.get('/', async function(req,res,next){
    try{
        const result=await client.query("SELECT id, comp_code FROM invoices");
        return res.json({invoices:result.rows});
    } catch(err){
        return next(err);
    }
});

//GET invoices:id
router.get("/:id", async function(req,res,next){
    try{
        const{id}=req.params;
        const result=await client.query("SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description FROM invoices AS i JOIN companies AS c ON (i.comp_code=c.code) WHERE id=$1",[id]);

        if(result.rows.length===0){
            throw new ExpressError(`No such invoice: ${id}`,404);
        }

        const data=result.rows[0];
        const invoice={
            id:data.id,
            company:{
                code:data.comp_code,
                name:data.name,
                description:data.description
            },
            amt:data.amt,
            paid:data.paid,
            add_date:data.add_date,
            paid_date:data.paid_date,
        };
        return res.json({invoice});
        } catch(err){
            return next(err);
        }
    });

//POST Invoice
router.post('/', async function(req,res,next){
    try{
        const{comp_code,amt}=req.body;
        const result=await client.query("INSERT INTO invoices (comp_code,amt) VALUES ($1,$2) RETURNING id,comp_code,amt,paid,add_date,paid_date",[comp_code,amt]);

        return res.status(201).json({invoice:result.rows[0]});
    } catch(err){
        return next(err);
    }
});

//PUT Invoice/:id
router.put("/:id", async function(req,res,next){
    try{
        const{id}=req.params;
        const{amt,paid}=req.body;
        let paid_date=null;
        const currResult=await client.query("SELECT paid FROM invoices WHERE id=$1",[id]);
        if(currResult.rows.length===0){
            throw new ExpressError(`No such invoice: ${id}`,404);
        }

        const currPaidDate=currResult.rows[0].paid_date;
        if(!currResult.rows[0].paid && paid){
            paid_date=new Date();
        } else if(!paid){
            paid_date=null;
        } else{
            paid_date=currPaidDate;
        }
        const result=await client.query("UPDATE invoices SET amt=$1,paid=$2,paid_date=$3 WHERE id=$4 RETURNING id,comp_code,amt,paid,add_date,paid_date",[amt,paid,paid_date,id]);
        return res.json({invoice:result.rows[0]});
    } catch(err){
        return next(err);
    }
});

//DELETE Invoice/:id
router.delete("/:id", async function(req,res,next){
    try{
        const{id}=req.params;
        const result=await client.query("DELETE FROM invoices WHERE id=$1 RETURNING id",[id]);

        if(result.rows.length===0){
            throw new ExpressError(`No such invoice: ${id}`,404);
        }

        return res.json({status:"deleted"});
    } catch(err){
        return next(err);
    }
});

module.exports=router;