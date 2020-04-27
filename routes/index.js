var express = require('express');
var router = express.Router();
var moment = require('moment');
var con = require('./modules/connection');


var daily_sales = [], products_avail =[];

router.use((req,res,next)=>{
  products_avail = [];
  async function init_Dashboard(){
      var tproducts = await get_total_products(req.session.no,'');
      var available = await get_total_products(req.session.no,'available');
      var notavailable = await get_total_products(req.session.no,'notavailable');

      products_avail.push(tproducts);
      products_avail.push(available);
      products_avail.push(notavailable);
      next();
  }
  init_Dashboard();
});



/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.no){
    res.redirect('/auth/login');
    res.end();
  }
  console.log(products_avail);
  res.render('pages/index', { 
    title: 'Advance POS',
    pravail : products_avail,
    user: req.session.username,
    image : req.session.image
  });
  res.end();
});


//Stock Tracker
router.get('/stock-tracker',(req,res)=>{
  if(!req.session.no){
    res.redirect('/auth/login');
    res.end();
  }
  async function product_stock(){
    var lowStock = await stock_tracker(req.session.no);
    res.json(lowStock);
    res.end();
  }
  product_stock();
});


// Get Daily Sales
router.get('/daily-sales',(req,res)=>{
  if(!req.session.no){
    res.redirect('/auth/login');
    res.end();
  }

  async function get_daily_date(){
    var sales_arr = [];
    var dsales = await get_daily_sale(req.session.no);
    for(var i=0; i<dsales.length;i++){
      var sales = {};
      var total = await daily_sales_total(req.session.no,dsales[i].ldate);
      var sum = total.reduce((a, b) => a + b, 0);
      sales['date'] = dsales[i].ldate;
      sales['total'] = sum;
      sales_arr.push(sales);
    }
    
    res.json(sales_arr);
    res.end();
  }
  get_daily_date();
});




//Functions ========================================

//Product Stock Tracker
function stock_tracker(_cno){
  var q = `SELECT * FROM products WHERE quantity < ?
          AND client_no	 = ?`
  var qVal = [10,_cno];  
  return new Promise(resolve=>{
    con.query(q,qVal,(err,rs)=>{
      if(err) throw err;
      resolve(rs);
    });
  });
};

//Get Daily Sales Date
function get_daily_sale(cno){
  var daily_sales = [];
  var q = `SELECT DATE_FORMAT(lastupdate,'%Y-%m-%d') as ldate FROM pos_paid_cart
    WHERE client_no = ? GROUP BY ldate`;
  var qVal = [cno];
  return new Promise((resolve)=>{
    con.query(q,qVal,(err,rs)=>{
      if(err) throw err;
      if(rs.length != 0){
        resolve(rs);
      }
    });
  });
}

//Get Daily Sales Total
function daily_sales_total(cno, _date){
    var dailySales_arr = [];
    var x = `SELECT IF(netpayable = 0, subtotal, netpayable) as total, 
      discount,DATE_FORMAT(lastupdate,'%Y-%m-%d') as ldate FROM pos_paid_cart
      WHERE client_no = ? AND lastupdate LIKE ?`;
    var xVal = [cno,_date+'%'];
    return new Promise(resolve => {
    con.query(x,xVal,(err,rs)=>{
      if(err) throw err;
      for(var x=0; x < rs.length; x++){
        if(_date === rs[x].ldate){
            dailySales_arr.push(Number(rs[x].total));
        }
      }
      // console.log(dailySales_arr);
      resolve(dailySales_arr);
    });
  });
}




//FUNCTIONS ===================================================================

function get_total_products(client_no,type){
  var q  = '', qVal;
  if(type === 'available'){
    q = 'SELECT * FROM products where client_no = ? AND status = ?';
    qVal = [client_no,type];
  }else if(type === "notavailable"){
    q = 'SELECT * FROM products where client_no = ? AND status = ?';
    qVal = [client_no,type];
  }else{
    q = 'SELECT * FROM products where client_no = ?';
    qVal = [client_no];
  }
  return new Promise(resolve =>{
    con.query(q,qVal,(err,rs)=>{
      if(err) throw err;
      resolve(rs.length);
    });
  });
}

module.exports = router;
