'use strict';

let Dashboard = function(){



    var _stock_tracker = function(){
        axios('/stock-tracker').then(function(e){
            // console.log(e.data);
            _table_stocktracker(e.data);
        });
    };


    var _get_daily_sales = function(){
        var date=[], sales=[];
        axios.get('/daily-sales').then(function(e){
            console.log(e.data);
            date.push('x');
            sales.push('Sales');
            for(var i=0;i<e.data.length;i++){
                date.push(moment(e.data[i].date).format('LL'));
                sales.push(e.data[i].total.toString());
            }
            _daily_sales_bar_chart(date,sales);
        })
    };

    //TABLES==========================================================================
    var _table_stocktracker = function(data){
        $('#stock-tracker').DataTable({
            data : data,
            paging: true,
            // bFilter: false,
            // ordering: false,
            searching: false,
            columns : [
                { data : 'name', sTitle : 'Product'},
                { data : 'quantity', sTitle : 'Stock'}
            ],
            bDestroy: true
        });
    };

    //CHARTS ==========================================================================
    var _daily_sales_bar_chart = function(_date,_sales){
        var daily_sales = document.getElementById('daily-sales');
        var daily_sales_chart = c3.generate({
            bindto: daily_sales,
            data: {
                x : 'x',
                columns: [
                    _date,
                    _sales
                ],
                // type: 'line',
                type: 'area-spline'
                
            },
            color: {
                pattern: ['#00BCD4', '#74f93b']
            },
            axis: {
                x: {
                    type: 'category',
                    tick: {
                        rotate: -90
                    },
                    height: 80
                }
            },
            grid: {
                x: {
                    show: true
                }
            }
        });

        daily_sales_chart.resize();
    };

    


    return {
        initDashboard : function(){
            _get_daily_sales();
            _stock_tracker();
        }
    }

}();



document.addEventListener('DOMContentLoaded',function(){
    Dashboard.initDashboard();
});