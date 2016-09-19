function init() {
    startTime();
    checkWeather();
    checkCalendar();
    getQuote();
}

function checkWeather() {
    getJSON("http://api.openweathermap.org/data/2.5/weather?q=wiesbaden&APPID=" + config.openweathermap_api + "&units=imperial",
      function(err, data) {
        if (err != null) {
          document.getElementById('weather').innerHTML = "Couldn't retrieve weather data";
        } else {
          document.getElementById('weather').innerHTML = 'WEATHER NOW <i class="owf owf-{0}"></i> {1}F'.format(
                                                              data.weather[0].id, Math.round(data.main.temp));
          var sunrise = new Date(data.sys.sunrise * 1000);
          var sunset = new Date(data.sys.sunset * 1000);
          document.getElementById('sun').innerHTML = "SUNRISE {0} SUNSET {1}".format(
                                                          getTime(sunrise), getTime(sunset));
        }
    });
    getJSON("http://api.openweathermap.org/data/2.5/forecast?q=wiesbaden&APPID=" + config.openweathermap_api + "&units=imperial",
      function(err, data) {
        if (err == null) {
          var sorted = {};
          for (var i = 0; i < data.list.length; i++){
              var d = new Date(data.list[i].dt * 1000);
              if (typeof sorted[d.getDayOfWeek()] == "undefined") {
                  sorted[d.getDayOfWeek()] = [];
              }
              sorted[d.getDayOfWeek()].push(data.list[i]);
          }
          var rows = [];
          var table = document.getElementById("forecast_table");
          table.innerHTML = "";
          for (var i = 0; i < 9; i++){
              rows.push(table.insertRow(i));
          }
          rows[0].insertCell(0);
          var index = 1;
          for (var i = 1; i < 9; i++){
              var d = new Date(sorted[Object.keys(sorted)[Object.keys(sorted).length - 2]][i-1].dt * 1000);
              var cell = rows[i].insertCell(0);
              cell.innerHTML = getTime(d);
          }
          for (key in sorted){
              var cell = rows[0].insertCell(index);
              cell.innerHTML = key;
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
                           }
                       }
                   }
              }
              index++;
          }
        }
    });
    var weatherTimer = setTimeout(checkWeather, 600000);
}

function getQuote(){
    getJSON("http://quotes.rest/qod.json?category=inspire",
      function(err, data) {
        if (err != null) {
          alert("Something went wrong: " + err);
        } else {
          var quote = data.contents.quotes[0];
          document.getElementById('quote').innerHTML = '{0}<div style="text-align:right">-{1}</div>'.format(
                                                              quote.quote, quote.author);
        }
    });
    var quoteTimer = setTimeout(getQuote, 43200000);
}

function checkCalendar() {
    document.getElementById('calendar').innerHTML = config.calendar_iframe;
    var calendarTimer = setTimeout(checkCalendar, 600000);
}

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('clock').innerHTML = '{0} {1} {2}<br>{3}:{4}:{5}'.format(today.getDayOfWeek(), today.getDate(), today.getMonthName(), h, m, s);
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

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("get", url, true);
    xhr.responseType = "json";
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };
    xhr.send();
};

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
