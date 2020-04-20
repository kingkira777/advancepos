const express = require('express');
const router = express.Router();
const con = require('./modules/connection');
const master = require('./modules/master');


//Variables
var category_arr = [];


router.use((req,res,next)=>{
    var cno = req.session.no;
    async function initCategory(){
        category_arr = await master.category_list(cno);

        next();
    }
    initCategory();
});

router.get('/category?',(req,res,next)=>{
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }


    var err = req.query.err;
    res.render('pages/category/category',{
        title : 'Category',
        category : category_arr,
        err : err
    });
    res.end();
}).post('/category/save',(req,res,next)=>{
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }


    var cno = req.session.no;
    var category = req.body.category;

    var c = `SELECT * FROM category WHERE name = ? AND client_no = ?`;
    var cVal = [category,cno];
    con.query(c,cVal,(err,rs)=>{
        if(err) throw err;
        if(rs.length == 0){
            var s= `INSERT INTO category(client_no,name) VALUES ?`;
            var sVal = [
                [cno,category]
            ];
            con.query(s,[sVal],(err1,rs1)=>{
                if(err1) throw err1
                res.redirect('/references/category');
                res.end();
            });
        }else{
            res.redirect('/references/category?err=1');
            res.end();
        }
    });


}).get('/category/delete?',(req,res,next)=>{
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }

    var id = req.query.id;
    var d = `DELETE FROM category WHERE id = ?`;
    var dVal =[id];
    con.query(d,dVal,(err,rs)=>{
        if(err) throw err;
        res.redirect('/references/category');
        res.end();
    });
});











module.exports = router;