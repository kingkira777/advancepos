const express = require('express');
const router = express.Router();
const master = require('./modules/master');
const con = require('./modules/connection');


// Login
router.get('/login',(req,res)=>{
    res.render('auth/login',{
        title : 'Login'
    });
    res.end();
});

router.get('/signup',(req,res)=>{
    res.render('auth/signup',{
        title : 'Signup'
    });
    res.end();
});


//Logout 
router.get('/logout',(req,res)=>{
    if(req.session.destroy()){
        res.redirect('/auth/login');
        res.end();
    }
});


//Login User
router.post('/login-user',(req,res)=>{
    var username = req.body.username;
    var password = req.body.password;
    
    var s = `SELECT * FROM users WHERE username =? AND password = ?`;
    var sVal = [username,password];
    con.query(s,sVal,(err,rs)=>{
        if(err) throw err;
        if(rs.length != 0){
            var cno = rs[0].no;
            var username = rs[0].username;
            req.session.no = cno;
            req.session.username = username;
            res.redirect('/');
            res.end();
        }
        if(rs.length == 0){
            res.redirect('/auth/login');
            res.end();
        }
    });
}); 




//Save New User
router.post('/save-new-user',(req,res)=>{
    var no = master.unique_id();
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;

    var c = `SELECT * FROM users WHERE username = ?`;
    var cVal = [username];
    con.query(c,cVal,(err,rs)=>{
        if(err) throw err;
        if(rs.length != 0){
            res.redirect('/auth/signup');
            res.end();
        }

        if(rs.length == 0){
            var s = `INSERT INTO users(no, username, password, email) VALUES ?`;
            var sVal = [
                [no,username,password,email]
            ];
            con.query(s,[sVal],(serr,srs)=>{
                if(serr) throw serr;
                res.redirect('/auth/login');
                res.end();
            });
        }
    });
});




module.exports = router;