$(window).resize(reflow);

function reflow(){
    if( $(window).width() / $(window).height() > 1){
        $('#calendar').css('position', 'absolute');
        $('#calendar').css('top', $('#container').css('top'));
        $('#container').css('width', '49.5%');
        $('#calendar').css('height', '99%');
        $('#calendar').css('left', $(window).width() / 2);
    } else {
        $('#calendar').css('position', 'relative');
        $('#calendar').css('top', 0);
        $('#container').css('width', '99%');
        $('#calendar').css('height', '60%');
        $('#calendar').css('left', 0);
    }
}

function init() {
    reflow();
    startTime();
    checkWeather();
    checkCalendar();
    getQuote();
}

function checkWeather() {
    $.ajax({url: "http://api.openweathermap.org/data/2.5/weather?q=wiesbaden&APPID=" + config.openweathermap_api + "&units=imperial",
           type: "GET",
           dataType: "json"})
    .done(function(json) {
        $('#weather').html('WEATHER NOW <i class="owf owf-{0}"></i> {1}F'.format(
                                           json.weather[0].id, Math.round(json.main.temp)));
        var sunrise = new Date(json.sys.sunrise * 1000);
        var sunset = new Date(json.sys.sunset * 1000);
        $('#sun').html("SUNRISE {0} SUNSET {1}".format(getTime(sunrise), getTime(sunset)));
        updateBackground(json.weather[0].id.toString());})
    .fail(function( xhr, status, errorThrown ) {
        $('#weather').html("Couldn't retrieve weather data");
    });

    $.ajax({url: "http://api.openweathermap.org/data/2.5/forecast?q=wiesbaden&APPID=" + config.openweathermap_api + "&units=imperial",
            type: "GET",
            dataType: "jsonp"})
    .done(function(json) {
        var sorted = {};
        var ctx = $("#tempChart");
        for (var i = 0; i < json.list.length; i++){
            var d = new Date(json.list[i].dt * 1000);
            if (typeof sorted[d.getDayOfWeek()] == "undefined") {
                sorted[d.getDayOfWeek()] = [];
            }
            sorted[d.getDayOfWeek()].push(json.list[i]);
        }
        var rows = [];
        var table = document.getElementById('forecast_table');
        table.innerHTML = "";
        for (var i = 0; i < 9; i++){
            rows.push(table.insertRow(i));
        }
        rows[0].insertCell(0);
        var index = 1;
        var temps = [];
        var labels = [];
        for (var i = 1; i < 9; i++){
            var d = new Date(sorted[Object.keys(sorted)[Object.keys(sorted).length - 2]][i-1].dt * 1000);
            var cell = rows[i].insertCell(0);
            cell.innerHTML = getTime(d);
        }
        for (key in sorted){
            var cell = rows[0].insertCell(index);
            cell.innerHTML = key;
            labels.push(key);
            var cells = [];
            for (var i = 1; i < 9; i++){
                cells.push(rows[i].insertCell(index));
            }
            for (var i = 0; i < 8; i++){
                if (typeof sorted[key][i] != "undefined"){
                    for (var ii = 1; ii < 9; ii++){
                        var d = new Date(sorted[key][i].dt * 1000);
                        if (rows[ii].cells[0].innerHTML == getTime(d)){
                            rows[ii].cells[index].innerHTML = '<i class="owf owf-{0}"></i> {1}F'.format(sorted[key][i].weather[0].id, Math.round(sorted[key][i].main.temp));
                            temps.push(Math.round(sorted[key][i].main.temp));
                            if(i != 0) {
                                labels.push(getTime(d));
                            }
                        }
                    }
                }
            }
            index++;
        }
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature',
                    fill: false,
                    data: temps,
                    borderColor: 'rgba(100,100,100,1)',
                    pointRadius: 1,
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:false
                        }
                    }]
                }
            }
        });
    });
    var weatherTimer = setTimeout(checkWeather, 600000);
}

function updateBackground (weatherId) {
    var sunny = ["800", "951"];
    var thunder = ["200", "201", "202", "210", "211", "212", "221", "230", "231", "232"];
    var drizzle = ["300", "301", "302", "310", "311", "312", "313", "314", "321"];
    var rain = ["500", "501", "502", "503", "504", "511", "520", "521", "522", "531"];
    var snow = ["600", "601", "602", "611", "612", "615", "616", "620", "621", "622"];
    var cloud = ["801", "802", "803", "804"];
    if (sunny.indexOf(weatherId) >= 0) {
        $('body').css('background-image', 'url("sunny.jpg")');
    } else if (thunder.indexOf(weatherId) >= 0) {
        $('body').css('background-image', 'url("thunder.jpg")');
    } else if (drizzle.indexOf(weatherId) >= 0) {
        $('body').css('background-image', 'url("drizzle.jpg")');
    } else if (rain.indexOf(weatherId) >= 0) {
        $('body').css('background-image', 'url("rain.jpg")');
    } else if (snow.indexOf(weatherId) >= 0) {
        $('body').css('background-image', 'url("snow.jpg")');
    } else if (cloud.indexOf(weatherId) >= 0) {
        $('body').css('background-image', 'url("cloud.jpg")');
    }
}

function getQuote(){
    $.ajax({url: "http://quotes.rest/qod.json?category=inspire",
          type: "GET",
          dataType: "json"})
    .done(function(json) {
        var quote = json.contents.quotes[0];
        $('#quote').html('{0}<div style="text-align:right">-{1}</div>'.format(
                                                              quote.quote, quote.author));})
    .fail(function( xhr, status, errorThrown ) {
        $('#quote').html('Could not retrieve quote');});
    var quoteTimer = setTimeout(getQuote, 43200000);
}

function checkCalendar() {
    $('#calendar').html(config.calendar_iframe);
    var calendarTimer = setTimeout(checkCalendar, 600000);
}

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    $('#clock').html('{0} {1} {2}<br>{3}:{4}:{5}'.format(today.getDayOfWeek(), today.getDate(), today.getMonthName(), h, m, s));
    var timeTimer = setTimeout(startTime, 1000);
}

function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}

function getTime(d){
    var h = d.getHours();
    var m = checkTime(d.getMinutes());
    return h + ":" + m;
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

Date.prototype.getDayOfWeek = function(){   
    return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][ this.getDay() ];
};

Date.prototype.getMonthName = function(){   
    return ["January","February","March","April","May","June","July","August","September","October","November","December"][ this.getMonth() ];
};
