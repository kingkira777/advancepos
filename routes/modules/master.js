const crypto = require('crypto');
const con = require('./connection');
const fs = require('fs');

let master = {


    //Cart List 
    cart_list : function(_cartno){
        var q = `SELECT a.price, a.quantity, a.total_price, b.name FROM pos_cart a
        LEFT JOIN products b on a.product_no = b.no
        WHERE a.no = ?`;
        var qVal = [_cartno];
        return new Promise((resolve)=>{
            con.query(q,qVal,(err,rs)=>{
                if(err) throw err;
                resolve(rs);
            });
        });
    },


    //Product List
    product_list : function(cno){
        var q = 'SELECT * FROM products WHERE client_no = ?';
        var qVal = [cno];
        return new Promise((resolve)=>{
            con.query(q,qVal,(err,rs)=>{
                if(err) throw err;
                resolve(rs);
            });
        });
    },

    //Category List
    category_list : function(cno){
        var q = `SELECT * FROM category WHERE client_no = ?`;
        var qVal = [cno];
        return new Promise((resolve)=>{
            con.query(q,qVal,(err,rs)=>{
                if(err) throw err;
                resolve(rs);
            });
        });
    },

    //Unique ID
    unique_id : function(){
        var no = crypto.randomBytes(6).toString('hex');
        return no;
    },

    // Delete Folder & Files
    delete_folder : function(_path){
        if(fs.existsSync(_path)){
            fs.readdirSync(_path).forEach((file,index)=>{
                var filePath = _path + "/" +file;
                if(fs.lstatSync(filePath).isDirectory()){
                    delete_folder(filePath);
                }else{
                    fs.unlinkSync(filePath);
                }
            });
            fs.rmdirSync(_path);
        }
    },

    // Delete file 
    delete_file : function(_path){
        if(fs.existsSync(_path)){
            fs.unlinkSync(_path);
        }
    }


};


module.exports = master;