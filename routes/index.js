var express = require('express');
var router = express.Router();
var moment = require('moment');
var con = require('./modules/connection');


var daily_sales = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.no){
    res.redirect('/auth/login');
    res.end();
  }

  res.render('pages/index', { 
    title: 'Advance POS' 
  });
  res.end();
});


// Get Daily Sales
router.get('/daily-sales',(req,res)=>{
  if(!req.session.no){
    res.redirect('/auth/login');
    res.end();
  }


  async function get_daily_date(){
    var _date = moment().format().split('T')[0];
    var _date1 = moment(_date).subtract(1, 'days').format().split('T')[0];
    var total = await get_daily_total(_date);
    var total1 = await get_daily_total(_date1);
    var data = [total,total1];
    res.json(data);
    res.end();
  }
  get_daily_date();
});




//Functions ========================================
function get_daily_total(_date){
  if(!req.session.no){
    res.redirect('/auth/login');
    res.end();
  }

  var netTotal= 0;
  var q = `SELECT subtotal,discount,netpayable FROM pos_paid_cart WHERE lastupdate LIKE ?`;
  var qVal = [_date+'%'];
  return new Promise((resolve)=>{
    con.query(q,qVal,(err,rs)=>{
      if(err) throw err;
      if(rs.length != 0){
        var total
        for(var i=0; i < rs.length; i++){
          total  = (rs[i].discount === '0')? rs[i].subtotal : rs[i].netpayable;
          netTotal = netTotal + Number(total);
        }
      }
      if(rs.length == 0){
        netTotal = 0; 
        
      }
      
      resolve(netTotal);
    });
  });
}



module.exports = router;
