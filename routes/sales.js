const express = require('express');
const router = express.Router();
const master = require('./modules/master');
const con = require('./modules/connection');


router.get('/',(req,res)=>{
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }
    res.render('pages/sales/sales',{
        title : 'Sales',
        user: req.session.username,
        image : req.session.image
    });
}).get('/table-sales?',(req,res)=>{
    var from = (req.query.from)? req.query.from : '';
    var to = (req.query.to)? req.query.to : '';
    async function sales(){
        var sales_arr = await get_sales(req.session.no,from,to);
        res.json(sales_arr);
        res.end();
    }
    sales();
});




//Functions ====================================================

function get_sales(cno,from,to){

    if(from === "" || to === ""){
        var q = `SELECT a.no, a.price, a.quantity, a.total_price, a.lastupdate, 
            b.name, b.cover_image FROM pos_cart a
            LEFT JOIN products b on a.product_no = b.no
            WHERE a.client_no = ?`;
        var qVal = [cno];
    }else{
        var q = `SELECT a.no, a.price, a.quantity, a.total_price, a.lastupdate, 
            b.name, b.cover_image FROM pos_cart a
            LEFT JOIN products b on a.product_no = b.no
            WHERE a.client_no = ? 
            AND (a.lastupdate >= ? AND a.lastupdate <= ?)
            OR (a.lastupdate = ? AND a.lastupdate = ?)`;
        var qVal = [cno,from,to,from,to];
    }

    return new Promise(resolve =>{
        con.query(q,qVal,(err,rs)=>{
            if(err) throw err;
            resolve(rs);
        });
    });

}



module.exports = router;