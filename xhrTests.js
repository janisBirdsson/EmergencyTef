function requestHttp(url, successCallback, errorCallback, resquestHeaders = [], noCache = false){
  let xhr = null;
  if(window.XMLHttpRequest){
    xhr = new XMLHttpRequest();
  }else{
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }
  
  xhr.onreadystatechange = () => {
    try{
      if(xhr.readyState == 4){
        var status = xhr.status;
        if(status >= 200 && status < 400 && xhr.HEADERS_RECEIVED){
          successCallback(xhr);
        }else{
          console.log("Problem connecting to " + url + ". Status: " + status);
          errorCallback(xhr);
        }
      }
    }catch(e){
      console.log(e);
    }
  };
  xhr.ontimeout = () => {
    console.log("Connection to " + url + "Timed out.");
    errorCallback(xhr);
  };
  xhr.open("GET", url, true);
  // xhr.setRequestHeader("Content-Security-Policy", "upgrade-insecure-requests");
  // xhr.setRequestHeader("Upgrade-Insecure-Requests", "1");
  resquestHeaders.forEach(pair => {
    console.log(pair.x + ":" + pair.v);
    xhr.setRequestHeader(pair.x, pair.v);
  });
  if(noCache){
    xhr.setRequestHeader(
      "Cache-Control", "no-cache, no-store, max-age=0, must-revalidate"
    );
    xhr.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT");
    xhr.setRequestHeader("Pragma", "no-cache");
  }
  //xhr.timeout = 2 * 1000;
  xhr.send();
}

console.log("Test!\n");
const host = window.location.hostname.substring(0, 29);
console.log("Host: \"" + host + "\"\n");

requestHttp(host + "/community/sylvanrah", (xhr) => {}, (xhr) => {});
