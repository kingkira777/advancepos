'use strick';



var Auth = function(){


    var _login = function(){
        $('#login').submit(function(e){
            var username = e.target[0].value
            var password = e.target[1].value;
            if(username != ""){

            }else if(password != ""){

            }else{
                $(this).submit();
            }
        }); 
    };

    var _signup = function(){
        $('#sign-up').submit(function(e){

            var username = e.target[0].value
            var password = e.target[1].value;
            var repassword = e.target[2].value;
            var email = e.target[3].value;
            var reeamil = e.target[4].value;

            if(password !== repassword){
                alert('Password not Mathced!');
            }else if(email !== reeamil){
                alert('Email not Mathced!');
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
