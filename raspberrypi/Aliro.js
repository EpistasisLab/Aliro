function pingURL() {

  // Aliro URL
  var URL = "http://localhost:5080"
  var settings = {
  
    // Defines the configurations
    // for the request
    cache: false,
    dataType: "jsonp",
    async: true,
    crossDomain: true,
    url: URL,
    method: "GET",
    headers: {
      accept: "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    timeout: 10000,
    tryCount: 0,
    tryLimit: 100,
    statusCode: {
      200: function (response) {
        location.assign(URL);
      },
      0: function () {
        this.url = URL;
        if (this.tryCount++ < this.tryLimit) {
          $.ajax(this);
        }
      }
    },
  };
  
  $.ajax(settings)
}