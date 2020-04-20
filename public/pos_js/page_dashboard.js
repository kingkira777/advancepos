'use strict';

let Dashboard = function(){


    

    var _daily_sales_data = function(){
        var ctx = document.getElementById('daily-sales').getContext('2d');
        var dataset = [];
        axios('/daily-sales')
        .then((e)=>{
             dataset = e.data;
             console.log(dataset);
             var config = {
                 type : 'line',
                 data : {
                     labels : ['Date'],
                     datasets : [{
                         label : 'Data',
                         backgroundColor  : '#38f788',
                         borderColor : '#262626',
                         data : dataset,
                     }],

                 }
             }

             window.daily_sales  = new Chart(ctx,config);

        });
    };



    return {
        initDashboard : function(){
            _daily_sales_data();
        }
    }

}();



document.addEventListener('DOMContentLoaded',function(){
    Dashboard.initDashboard();
});