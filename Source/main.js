// Stock Name List
var stockName = []
var stockPrice = []
var myChart = ""
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

// OnReady Call
$(document).ready(function () {
    // Ready       

    // on Enter - redirect to addStock
    $("#stockName").keyup(function (event) {
        if (event.keyCode === 13) {            
            $("#addStock").click();            
        }
    })    

    // Add Stock Action Button
    $("#addStock").on("click", function () {
        currStockName = document.getElementById('stockName').value.toUpperCase();
        
        // MakeURL for new Stock  
        // Make an AJAX
        if (currStockName.length >= 1){
            var url = makeURL(currStockName);
            manageCalls(url);        
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
    })

});

// Make Call
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
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

// Make Ajax Call
function sendAjaxRequest(url, successCallBackFn) {
    $.ajax({
        type: "GET",
        url: url,
        success: successCallBackFn,
        statusCode: {},
        error: function () {
            console.log("Unable to process your request.");
            clearInterval(timelyUpdate);
            tryAgain = true;            
        }
    });
}

// Manage response
function manageCalls(url){
    success = false;
    sendAjaxRequest(url, function(response) {
        console.log(response);
        if (response[currentPrice]==0){
            // Alert Wrong Ticker
            success=false;
        }
        else{
            success = true;
            currentPriceValue = response[currentPrice];
        }
        
        if (success == true) {            
            // Only on success
            stockName.push(currStockName);
            stockPrice.push(currentPriceValue);            

            // Update Chart
            if (stockName.length == 1) {
                createChart();
                // Start timely updates
                timelyUpdate = setInterval(chartUpdate, 5000);         
            }
            else {
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


            $('#stockName').val("");
        }
    });    
}

function chartUpdate() {
    
    var iURL = ""

    var newStockPrice = []

    var l = stockName.length

    for(var i in stockName){        
        iURL = makeURL(stockName[i]);        
        sendAjaxRequest(iURL, function (response) {
            console.log(response);
            newStockPrice.push(response[currentPrice]);
            if (newStockPrice.length == l){
                myChart.update();
            }
        });        
    }
}