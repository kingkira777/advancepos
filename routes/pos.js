const express = require('express');
const router = express.Router();
const con = require('./modules/connection');
const master = require('./modules/master');

var product_arr =[], category_arr =[];

router.use((req,res,next)=>{
    var cno = req.session.no;
    async function initPost(){
        product_arr = await master.product_list(cno);
        category_arr = await master.category_list(cno);
        next();
    }
    initPost();
});

//POS Index
router.get('/',(req,res,next)=>{
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }


    res.render('pages/pos/pos',{
        title : 'Point Of Sale',
        products : product_arr,
        category : category_arr
    });
    res.end();
});

//============================================ Receipt========================================================
router.get('/cart-receipt?',(req,res)=>{
    if(!req.session.no){
        res.redirect('/auth/login');
        res.end();
    }

    
    var cartno = req.query.cartno;
    var cart_arr =[];
    async function cart_list(){
        cart_arr = await master.cart_list(cartno);

        var q = `SELECT * FROM pos_paid_cart WHERE cart_no = ?`;
        var qVal = [cartno];
        con.query(q,qVal,(err,rs)=>{
            if(err) throw err;
            res.render('pages/pos/receipt',{
                tilte : 'Cart Receipt',
                cartlist : cart_arr,
                cartpaid : rs 
            });
            res.end();
        });
    }


    cart_list();
});



//============================================= Save Paid Cart================================================
router.post('/paid-cart',(req,res,next)=>{
    var cno = req.session.cno;
    var cartno = req.body.cartno;
    var subtotal = req.body.subtotal;
    var discount = req.body.discount;
    var payable = req.body.payable;
    var money = req.body.money;
    var change  = req.body.change;
    
    var c = `SELECT * FROM pos_paid_cart WHERE cart_no = ? AND client_no = ?`;
    var cVal = [cartno,cno];
    con.query(c,cVal,(err,rs)=>{
        if(err) throw err;
        if(rs.length != 0){
            var u = `UPDATE SET subtotal = ?, discount = ?, netpayable = ?, money = ?
            change_money = ? WHERE cart_no = ? AND client_no = ?`;
            var uVal = [subtotal, discount, payable, money, change, cartno,cno];
            con.query(u,uVal,(err2,rs2)=>{
                if(err2) throw err2;
                res.json({
                    message : 'update'
                });
                res.end();
            });
        }
        if(rs.length == 0){
            var s = `INSERT INTO pos_paid_cart(client_no, cart_no, subtotal, discount, netpayable, 
                money, change_money) VALUES ?`;
            var sVal = [
                [cno, cartno, subtotal, discount, payable, money, change]
            ];
            con.query(s,[sVal], (err1,rs1)=>{
                if(err1) throw err1
                res.json({
                    message : 'added'
                });
                res.end();
            });
        }
    }); 

});


//=========================================Get Cart Items Subtotal=============================================
router.get('/cart-items-subtotal?',(req,res,next)=>{

    var cno = rerq.session.no;
    var cartno = req.query.cartno;
    var q = `SELECT SUM(total_price) as total FROM pos_cart WHERE no = ? AND client_no = ?`;
    var qVal = [cartno,cno];
    con.query(q,qVal,(err,rs)=>{
        if(err) throw err;
        res.json(rs);
    });

});


//Update Quantity=================================================
router.post('/update-quantity',(req,res,next)=>{
    var id = req.body.id;
    var quantity = req.body.quantity;
    var total_price = req.body.total_price;
    var q = `UPDATE pos_cart SET quantity = ?, total_price = ? WHERE id = ?`;
    var qVal = [quantity,total_price,id];
    con.query(q,qVal,(err,rs)=>{
        if(err) throw err;
        res.json({
            message : 'updated'
        })
    });
}); 

//Cancel Cart Items
router.post('/cancel-cart-items',(req,res,next)=>{

    var cno = req.session.no;
    var cartno = req.body.cartno;
    var d = `DELETE FROM pos_cart WHERE no = ? AND client_no = ?`;
    var dVal = [cartno,cno];
    con.query(d,dVal,(err,rs)=>{
        if(err) throw err;
        res.json({
            message : 'canceled'
        })
    });
});

//Delete Item From Cart
router.post('/delete-item',(req,res,next)=>{
    var id = req.body.id;
    var d = `DELETE FROM pos_cart WHERE id = ?`;
    var dVal = [id];
    con.query(d,dVal,(err,rs)=>{
        if(err) throw err;
        res.json({
            message : 'deleted'
        })
    });
});


//Get Item Cart===================================================
router.get('/cart-items?',(req,res,next)=>{
    var cno = req.session.no;
    var cartno = req.query.cartno;
    var q = `SELECT a.id, a.price, a.quantity, a.total_price, b.name FROM pos_cart a
        LEFT JOIN products b on a.product_no = b.no
        WHERE a.no = ? AND a.client_no = ?`;
    var qVal = [cartno,cno];
    con.query(q,qVal,(err,rs)=>{
        if(err) throw err; 
        res.json(rs);
        res.end();
    });
});


// Add Item to Cart==============================
router.post('/add-item-to-cart',(req,res,next)=>{
    var cno = req.session.no;
    var cartno  = req.body.cartno;
    var productno = req.body.productno;
    var q = `SELECT * FROM pos_cart WHERE client_no = ? AND no = ? AND product_no =?`;
    var qVal = [cno,cartno,productno];
    con.query(q,qVal,(err,rs)=>{
        if(err) throw err;
        if(rs.length != 0){
            res.json({
                message : 'exist'
            });
            res.end();
        }else{
            var p = `SELECT * FROM products WHERE client_no = ? AND no = ?`;
            var pVal = [cno, productno];
            con.query(p,pVal,(err1,rs1)=>{
                if(err1) throw err1;
                if(rs1.length == 0){
                    res.json({
                        message : 'notexist'
                    });
                }else{
                    var price = rs1[0].price;
                    var quantity = 1;
                    var totalprice = Number(price) * Number(quantity);
                    
                    //INSERT IT CART
                    var s = `INSERT INTO pos_cart(client_no, no, product_no, price, quantity, total_price) VALUES ?`;
                    var sVal = [
                        [cno,cartno,productno,price,quantity,totalprice]
                    ];
                    con.query(s,[sVal],(err2,rs2)=>{
                        if(err2) throw err2;
                        res.json({
                            message : 'added'
                        })
                    });
                }
            });
        }
    });


});


//Select Category===============================
router.post('/select-category',(req,res,next)=>{
    var cno =req.session.no;
    var catname = req.body.name;
    if(catname === ""){
        var q = `SELECT * FROM products WHERE client_no = ?`;
        var qVal = [cno];
        con.query(q,qVal,(err,rs)=>{
            if(err){
                res.json({
                    message : err
                });
            }
            res.json(rs);
        });
    }else{
        var q = `SELECT * FROM products WHERE client_no = ? AND category = ?`;
        var qVal = [cno, catname];
        con.query(q,qVal,(err,rs)=>{
            if(err){
                res.json({
                    message : err
                });
            }
            res.json(rs);
        });
    }
});

// Cart Receipt 


// Get Cart No========================
router.get('/cart-no',(req,res,next)=>{
    var cartno = master.unique_id();
    res.json({
        message : cartno
    });
    res.end();
});

module.exports = router;