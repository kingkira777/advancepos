'use stick';


var User = function(){

    var _get_profile_image = function(){
        axios.get('/user/profile-image').then(function(e){
            // console.log(e.data);
            if(e.data.length !=0 && e.data[0].profile_image !== ""){
                $('#prof-image').prop('src', e.data[0].profile_image);
            }else{
                $('#prof-image').prop('src','/global_assets/images/placeholders/placeholder.jpg');
            }
        });
    };

    var _upload_profile_image = function(){
        $('#profileImage-form').submit(function(){
            $(this).ajaxSubmit({
                success : function(e){
                    console.log(e)
                    if(e.message === "uploaded"){
                        master._message_box('Successfuly Uploaded','success');
                    }
                    _get_profile_image();
                }
            });
            return false;
        });
    };

    var _update_profile = function(){
        $('#profile-form').submit(function(e){
            
            var lname = e.target[0].value;
            var fname = e.target[1].value;
            var gender = e.target[3].value;
            var dob = e.target[4].value;
            
            if(lname === ""){
                master._message_box('Lastname is Empty','warning');
            }else if(fname === ""){
                master._message_box('Firstname is Empty','warning');
            }else if(gender === ""){
                master._message_box('Gender is Empty','warning');
            }else if(dob === ""){
                master._message_box('Date of Birth is Empty','warning');
            }else{
                $(this).ajaxSubmit({
                    success : function(x){
                        console.log(x);
                        if(x.message === "saved"){
                            master._message_box('Successfuly Updated','success');
                        }
                        if(x.message === "updated"){
                            master._message_box('Successfuly Updated','success');
                        }
                    }
                });
            }
            return false;
        });
    };  

    //ACCOUNT SETTINGS ===========================================
    
    //Update Store Information
    var _update_store_info = function(){
        $('#storeinfo-form').submit(function(e){
            if(e.target[0].value === ""){
                master._message_box('Store name is Empty','warning');
            }else if(e.target[1].value === ""){
                master._message_box('Email Address Empty','warning');
            }else if(e.target[2].value === ""){
                master._message_box('Telephone Number is Empty','warning');
            }else if(e.target[3].value === ""){
                master._message_box('Address is Empty','warning');
            }else{
                $(this).ajaxSubmit({
                    success : function(x){
                        if(x.message === "updated"){
                            master._message_box('Successfuly Updated','success');
                        }
                    }
                });
            }
            return false;
        });
    };

    //Change Passsword
    var _change_password = function(){
        $('#changepass-form').submit(function(e){
            if(e.target[0].value === ""){
                master._message_box('Current Password is Empty','warning');
            }else if(e.target[1].value === ""){
                master._message_box('New Password is Empty','warning');
            }else if(e.target[2].value === ""){
                master._message_box('Retype Password is Empty','warning');
            }else if(e.target[1].value != e.target[2].value){
                master._message_box('Password Not Matched!','warning');
            }else{
                $(this).ajaxSubmit({
                    success : function(x){
                        if(x.message === "updated"){
                            master._message_box('Successfuly Updated','success');
                        }
                        if(x.message === "invalid"){
                            master._message_box('Invalid Password','warning');
                        }
                    }
                })
            }
            return false;
        });
    };

    //Update Account
    var _update_account = function(){
        $('#account-form').submit(function(e){
            if(e.target[0].value === ""){
                master._message_box('Username is Empty','warning');
            }else if(e.target[1].value === ""){
                master._message_box('Email Address is Empty','warning');
            }else if(e.target[2].value === ""){
                master._message_box('Password is Empty','warning');
            }else{
                $(this).ajaxSubmit({
                    success: function(x){
                        if(x.message === "updated"){
                            master._message_box('Successfuly Updated','success');
                        }
                        if(x.message === "invalid"){
                            master._message_box('Invalid Password','warning');
                        }
                    }
                })
            }
            return false;
        });
    };



    return {
        initProfile : function(){
            _update_profile();
            _get_profile_image();
            _upload_profile_image();
        },
        initSettings : function(){
            _change_password();
            _update_account();
            _update_store_info();
        }
    };

}();




document.addEventListener('DOMContentLoaded',function(){
    User.initProfile();
    User.initSettings();
});
