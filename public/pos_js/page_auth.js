'use strick';



var Auth = function(){


    var _login = function(){
        $('#login').submit(function(e){
            var username = e.target[0].value
            var password = e.target[1].value;
            if(username === ""){
                master._message_box('Username is Empty!','warning');
            }else if(password === ""){
                master._message_box('Password is Empty!','warning');
            }else{
                $(this).submit();
            }
            e.preventDefault();
        }); 
    };

    var _signup = function(){
        $('#sign-up').submit(function(e){

            var username = e.target[0].value
            var password = e.target[1].value;
            var repassword = e.target[2].value;
            var email = e.target[3].value;
            var reeamil = e.target[4].value;

            if(username === "" || password === "" || repassword === "" 
                || email === "" || reeamil === ""){
                master._message_box('Some Field(s) is Empty!','warning');
            }else if(password !== repassword){
                master._message_box('Password not Mathced!','warning');
            }else if(email !== reeamil){
                master._message_box('Email not Mathced!','warning');
            }else{
                $(this).submit();
            }
            e.preventDefault();
        });
    }

    return {
        initAuth : function(){
            _signup();
            _login();
        }
    }

}();


document.addEventListener('DOMContentLoaded',function(){
    Auth.initAuth();
});
