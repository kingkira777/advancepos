const express = require('express');
const router = express.Router();
const master = require('./modules/master');
const con = require('./modules/connection');

// Login
router.get('/login?',(req,res)=>{
    var err = req.query.err;
    res.render('auth/login',{
        title : 'Login',
        err : err
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
    
    var s = `SELECT a.no, a.username, a.password, a.email,
        b.firstname, b.lastname, b.profile_image FROM users a 
        LEFT JOIN user_profile b on a.no = b.client_no
        WHERE a.username =? AND a.password = ?`;
    var sVal = [username,password];
    con.query(s,sVal,(err,rs)=>{
        if(err) throw err;
        if(rs.length != 0){
            var cno = rs[0].no;
            var username = rs[0].username;
            var image = rs[0].profile_image;
            var name = (rs[0].firstname)? rs[0].firstname+' '+ rs[0].lastname : username;
            req.session.no = cno;
            req.session.userno = cno;
            req.session.username = name;
            req.session.image = image;
            res.redirect('/');
            res.end();
        }
        if(rs.length == 0){
            res.redirect('/auth/login?err=1');
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
            master.send_mail(email).then(x=>{
                var s = `INSERT INTO users(no, username, password, email) VALUES ?`;
                var sVal = [
                    [no,username,password,email]
                ];
                con.query(s,[sVal],(serr,srs)=>{
                    if(serr) throw serr;
                    res.redirect('/auth/login');
                    res.end();
                });
            });
        }
    });
});




module.exports = router;