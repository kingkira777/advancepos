var express = require('express');
var router = express.Router();
var master = require('./modules/master');
var con = require('./modules/connection');
var fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// User Profile ============================================================
router.get('/profile',(req,res,next)=>{
  if(!req.session.no){
    res.redirect('/auth/login');
    res.end();
  }

  async function init_UserProfile(){
    var profile = await get_userProfile(req.session.no);
    res.render('pages/user/profile',{
      title : 'User Profile',
      user : req.session.username,
      image : req.session.image,
      profile : profile,
    image : req.session.image
    });
    res.end();
  }

  init_UserProfile();
});



//Update Profile ==========================
router.post('/update-profile',(req,res)=>{

  var cno = req.session.no;
  // var userno = req.session.;
  var lastname = req.body.lastname;
  var firstname = req.body.firstname;
  var middlename = req.body.middlename;
  var gender = req.body.gender;
  var dob = req.body.dob;
  var cellno = req.body.cellno;
  var telno = req.body.telno;
  var address = req.body.address;

  var c = `SELECT * FROM user_profile WHERE user_no = ?`;
  var cVal = [cno];
  con.query(c,cVal,(err,rs)=>{
    if(err) throw err;
    if(rs.length != 0){
      var u = `UPDATE user_profile SET firstname = ?, lastname = ?, middlename = ?,
      gender = ?, dob = ?, cellphoneno = ?, telephoneno = ?, address = ?
      WHERE client_no = ? AND user_no = ?`;
      var uVal = [firstname,lastname,middlename,gender,dob,cellno,telno,address,cno,cno];
      con.query(u,uVal,(err1,rs1)=>{
        if(err1) throw err1;
        res.json({
          message : 'updated'
        });
        res.end();
      });
    }
    if(rs.length == 0){
      var s = `INSERT INTO user_profile(client_no, user_no, firstname, lastname,
        middlename, gender, dob, cellphoneno, telephoneno, address) VALUES ?`;
      var sVal = [
        [cno,cno,firstname,lastname,middlename,gender,dob,cellno,telno,address]
      ];
      con.query(s,[sVal],(err2,rs2)=>{
        if(err2) throw err2;
        res.json({
          message : 'saved'
        });
        res.end();
      });
    }
  });
});

//Get Profile Image
router.get('/profile-image',(req,res)=>{
  var userno = req.session.userno;
  var q = `SELECT profile_image FROM user_profile WHERE client_no = ? AND user_no = ?`;
  var qVal = [userno,userno];
  con.query(q,qVal,(err,rs)=>{
    if(err) throw err;
    res.json(rs);
    res.end();
  });
});


//Upload Profile Image
router.post('/upload-profile',(req,res)=>{
  if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
  }

  var userno = req.session.userno;

  let imageFile = req.files.imageFile;
  let name = imageFile.name;
  let path = 'public/assets/profile-image/'+userno;
  let savePath = '/assets/profile-image/'+userno+'/'+name;

  if(!fs.existsSync(path)){
    fs.mkdirSync(path);
  }

  imageFile.mv(path+'/'+name,(err)=>{
    if(err) throw err;

    var c = `SELECT * FROM user_profile WHERE client_no = ? AND user_no = ?`;
    var cVal = [userno,userno];
    con.query(c,cVal,(cerr,crs)=>{
      if(cerr) throw cerr;
      if(crs.length != 0){
        var u = `UPDATE user_profile SET profile_image = ? 
        WHERE client_no =? AND user_no = ?`;
        var uVal = [savePath,userno,userno];
        con.query(u,uVal,(err1,rs)=>{
          if(err1) throw err1;
          res.json({
            message : 'uploaded'
          });
          res.end();
        });
      }
      if(crs.length == 0){
        var s = `INSERT INTO user_profile(client_no,user_no,profile_image) VALUES ?`;
        var sVal = [
          [userno,userno,savePath]
        ];
        con.query(s,[sVal],(serr,srs)=>{
          if(serr) throw serr;
          res.json({
            message : 'uploaded'
          });
          res.end();
        });
      }
    });

    
  });
});


// User Settings ===========================================================
router.get('/Settings',(req,res,next)=>{
  if(!req.session.no){
    res.redirect('/auth/login');
    res.end();
  }
  async function initAccountSettings(){

    var acctInfo = await get_accountInfo(req.session.no);
    var storeinfo = await master.store_information(req.session.no);

    res.render('pages/user/settings',{
      title : 'User Settings',
      user : req.session.username,
      image : req.session.image,
      account : acctInfo,
      storeinfo : storeinfo
    });
    res.end();

  }
  initAccountSettings();
});


//Change Password ===========================================
router.post('/change-password',(req,res)=>{
  var userno = req.session.no;
  var password = req.body.password;
  var newpassword = req.body.newpassword;

  var c = `SELECT * FROM users WHERE no = ? AND password = ?`;
  var cVal = [userno,password];
  con.query(c,cVal,(err,rs)=>{
    if(err) throw err;
    if(rs.length != 0){
      var u = `UPDATE users SET password = ? WHERE no = ?`;
      var uVal = [newpassword,userno];
      con.query(u,uVal,(err,rs)=>{
        if(err) throw err;
        res.json({
          message : 'updated'
        });
        res.end();
      });
    }else{
      res.json({
        message : 'invalid'
      });
      res.end();
    }
  });

});

//Update Account Settings ===================================
router.post('/update-account',(req,res,next)=>{

  var userno = req.session.no;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;

  var c = `SELECT * FROM users WHERE no = ? AND password = ?`;
  var cVal = [userno,password];
  con.query(c,cVal,(err,rs)=>{
    if(err) throw err;
    if(rs.length != 0){
      var u = `UPDATE users SET username = ?, email = ?
      WHERE no = ? AND password = ?`;
      var uVal = [username,email,userno,password];
      con.query(u,uVal,(err,rs)=>{
        if(err) throw err;
        res.json({
          message : 'updated'
        });
        res.end();
      });
    }else{
      res.json({
        message : 'invalid'
      });
      res.end();
    }
  });


});


router.post('/update-storeinfo',(req,res)=>{

  var userno = req.session.no;
  var name = req.body.name;
  var email = req.body.email;
  var telephone = req.body.telephone;
  var address = req.body.address

  var c = `SELECT * FROM store_information WHERE client_no = ?`;
  var cVal = [userno];
  con.query(c,cVal,(err,rs)=>{
    if(err) throw err;
    if(rs.length != 0){
      var u = `UPDATE store_information SET name = ?, email = ?,
      telephoneno = ?, address = ? WHERE client_no = ?`;
      var uVal = [name,email,telephone,address,userno];
      con.query(u,uVal,(err,rs)=>{
        if(err) throw err;
        res.json({
          message : 'updated'
        });
        res.end();
      });
    }
    if(rs.length == 0){
      var s = `INSERT INTO store_information(client_no, name,email,
        telephoneno, address) VALUES ?`;
      var sVal = [
        [userno,name,email,telephone,address]
      ];
      con.query(s,[sVal],(err,rs)=>{
        if(err) throw err;
        res.json({
          message : 'updated'
        });
        res.end();
      })
    }
  });


});






//FUNCTIONS ===================================================


function get_accountInfo(_cno){
  var q = `SELECT * FROM users WHERE no = ?`;
  var qVal = [_cno];
  return new Promise(resolve =>{
    con.query(q,qVal,(err,rs)=>{
      if(err) throw err;
      resolve(rs);
    });
  });
}


function get_userProfile(_userno){
  var q = `SELECT * FROM user_profile WHERE user_no = ?`;
  var qVal = [_userno];
  return new Promise(resolve => {
    con.query(q,qVal,(err,rs)=>{
      if(err) throw err;
      resolve(rs);
    });
  });
}


module.exports = router;
