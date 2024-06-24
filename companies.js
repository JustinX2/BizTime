const express=require('express');
const router=new express.Router();
const client=require('../db');

//GET Companies
router.get('/', async function(req,res,next){
    try{
        const result=await client.query("SELECT code, name FROM companies");
        return res.json({companies:result.rows});
    } catch(err){
        return next(err);
    }
});

//GET Company by code
router.get("/:code", async function(req,res,next){
    try{
        const {code}=req.params;
        const result=await client.query("SELECT code, name, description FROM companies WHERE code=$1",[code]);
        
        if(result.rows.length===0){
            throw new ExpressError(`No such company: ${code}`,404);
        }

        const invoiceResult=await client.query("SELECT id FROM invoices WHERE comp_code=$1",[code]);
        const company=result.rows[0];
        company.invoices=invoiceResult.rows.map(inv=>inv.id);

        return res.json({company:result.rows[0]});
    } catch(err){
        return next(err);
    }
});

//POST Company
router.post('/', async function(req,res,next){
    try{
        const {code,name,description}=req.body;
        const result=await client.query("INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING code,name,description",[code,name,description]);

        return res.status(201).json({company:result.rows[0]});
    } catch(err){
        return next(err);
    }
});

//PUT Company/:code
router.put("/:code", async function(req,res,next){
    try{
        const {code}=req.params;
        const {name,description}=req.body;
        const result=await client.query("UPDATE companies SET name=$1,description=$2 WHERE code=$3 RETURNING code,name,description",[name,description,code]);

        if(result.rows.length===0){
            throw new ExpressError(`No such company: ${code}`,404);
        }

        return res.json({company:result.rows[0]});
    } catch(err){
        return next(err);
    }
});

//DELETE Company/:code
router.delete("/:code", async function(req,res,next){
    try{
        const {code}=req.params;
        const result=await client.query("DELETE FROM companies WHERE code=$1 RETURNING code",[code]);

        if(result.rows.length===0){
            throw new ExpressError(`No such company: ${code}`,404);
        }

        return res.json({status:"deleted"});
    } catch(err){
        return next(err);
    }
});

module.exports=router;



