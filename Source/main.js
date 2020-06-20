// Global Variables
var mapStock = {};
var stockName = [];
var stockPrice = [];
var newStockPrice = [];
var myChart;
var currentPrice = 'c';
var highPrice = 'h';
var lowPrice = 'l';
var openPrice = 'o';
var prevClosePrice = 'pc';
var success = false;
var currentPriceValue = 0;
var currStockName = "";
var timelyUpdate = ""
var tryAgain = ""
var l = 0;

// OnReady Call
$(document).ready(function () {
    
    // Ready, then Focus on Input
    $("#stockName").focus();


    // on Enter in Input - redirect to addStock
    $("#stockName").keyup(function (event) {
        if (event.keyCode === 13) {            
            $("#addStock").click();            
        }
    })    


    // Add Stock Action Button
    $("#addStock").on("click", function () {
        currStockName = document.getElementById('stockName').value.toUpperCase();        
        // MakeURL for new Stock and manage AJAX Call        
        if (currStockName.length >= 1 && !(currStockName in mapStock)){
            var url = makeURL(currStockName);        
            manageCalls(url);        
        }
        else{
            $('#stockName').val("");
        }
    });        


    // Reset the stocks
    $("#resetStock").on("click", function() {
        stockName = []
        stockPrice = []
        myChart.reset();
        myChart.destroy();
        myChart = "";
        $("#stockList ol").empty();
        clearInterval(timelyUpdate);
        document.getElementById("stockList").style.display = "none";
    })

});

// Make URL
function makeURL(ticker){    
    return "https://finnhub.io/api/v1/quote?symbol="+ticker+"&token=brju1avrh5r9g3otf3dg"
}

// Create Card
function createCard(val)
{
 var c ='<li><div class="card" style="width: 100%;"><div class="card-body"><h5 class="card-title">'+val+'</h5></div></div></li>';
 return c;
}

// Create Chart
function createChart()
{
    var ctx = document.getElementById('myChart');
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: stockName,
            datasets: [{
                label: 'Stock Price',
                data: stockPrice,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    barPercentage: 1
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,                        
                        // Include a dollar sign in the ticks
                        callback: function (value, index, values) {
                            return '$' + value;
                        }                        
                    },
                    gridLines: {
                        drawOnChartArea: false
                    }
                }]
            },
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    fontColor: 'black'                    
                }
            },
            "animation": {
                "duration": 2,
                "onComplete": function () {
                    var chartInstance = this.chart,
                        ctx = chartInstance.ctx;                   
                    
                    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, "bold", Chart.defaults.global.defaultFontFamily);                    
                    
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';

                    this.data.datasets.forEach(function (dataset, i) {
                        var meta = chartInstance.controller.getDatasetMeta(i);
                        meta.data.forEach(function (bar, index) {
                            var data = dataset.data[index];                            
                            ctx.fillText(data, bar._model.x, bar._model.y - 5);
                        });
                    });
                }
            }          
        }
    });
}

// Update Request AJAX Calls
function sendAjaxRequestToUpdate(url, stockName) {
    $.ajax({
        type: "GET",
        url: url,
        success: function (response) {
            // console.log(response);
            newStockPrice.push(response[currentPrice]);
            stockPrice[mapStock[stockName]] = response[currentPrice];
            if (newStockPrice.length == l) {         
                console.log(stockPrice);       
                myChart.data.datasets[0].data = stockPrice;                                
                myChart.update();
            }
        },
        statusCode: {},
        error: function () {
            console.log("Unable to process your request.");
            clearInterval(timelyUpdate);
            tryAgain = true;
        }
    });
}


// Make Initial Ajax Calls
function sendAjaxRequest(url, successcallbackfunction) {
    $.ajax({
        type: "GET",
        url: url,
        success: successcallbackfunction,
        statusCode: {},
        error: function () {
            console.log("Unable to process your request.");
            clearInterval(timelyUpdate);
            tryAgain = true;            
        }
    });
}


// Is Empty Function
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// Manage Initial responses
function manageCalls(url){
    success = false;
    sendAjaxRequest(url, function(response) {
        console.log(response);
        if (response[currentPrice]==0){
            // Alert Wrong Ticker
            success=false;
            $('#stockName').val("");
        }
        else if (isEmpty(response)) {
            success = false;
            $('#stockName').val("");
        }
        else{
            success = true;
            currentPriceValue = response[currentPrice];
        }
        
        if (success == true) {            
            // Only on success
            stockName.push(currStockName);
            stockPrice.push(currentPriceValue); 
            mapStock[currStockName] = stockName.length - 1;           

            // Update Chart
            if (stockName.length == 1) {
                document.getElementById("stockList").style.display = "block";
                createChart();
                // Start timely updates
                timelyUpdate = setInterval(chartUpdate, 5000);         
            }
            else {
                // If Error Occurs
                if (tryAgain==true){
                    timelyUpdate = setInterval(chartUpdate, 5000);
                    tryAgain = false;
                }
                myChart.update()                
            }

            // Display All Stocks
            // Create a Card
            var x = createCard(currStockName);
            $("#stockList ol").append(x);

            // CLear Input Field
            $('#stockName').val("");
        }
    });    
}


// Update Chart
function chartUpdate() {

    console.log("Updating");
    
    var iURL = ""

    newStockPrice = [];
    l = stockName.length

    for(var i in stockName){        
        iURL = makeURL(stockName[i]);        
        sendAjaxRequestToUpdate(iURL, stockName[i]);        
    }
}