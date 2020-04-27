const express = require('express');
const router = express.Router();


router.get('/(:cno)',(req,res)=>{

    res.render('pages/kitchen/kitchen',{
        title : 'Kitchen'
    });
    res.end();

});







module.exports = router;