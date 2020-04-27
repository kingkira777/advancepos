'use strict';

var master = {


    _message_box : function(msg,type){
        swal({
            title: '',
            text: msg,
            type: type,
            confirmButtonClass : 'btn btn-primary'
        });
    },

    _delete_data: function (fnBack) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            buttonsStyling: false
        }).then(fnBack);
    }

};
