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
  console.log(resquestHeaders);
  resquestHeaders.forEach(pair => {
    console.log(pair[0] + ":" + pair[1]);
    xhr.setRequestHeader(pair[0], pair[1]);
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

console.log("Test2!\n");
const target = "https://" + window.location.hostname.substring(0, 29);
console.log("Host: \"" + target + "\"\n");

requestHttp(
  target + "/community/sylvanrah",
  (xhr) => {console.log("success"); console.log(xhr)},
  (xhr) => {console.log("fail")},
  [["Cookie", "SESS3d506d9bc855ddcd3287f9913e63767c=5nthk9qrkek76ftrnu48jq5g42; has_js=1; SESS903465f0adcfe01479847cb3d1bb9c52=3k7gr84qkdlpa1pvqatpveq262"]]
);

requestHttp(
  target + "/machine/playerpage.php?symbol=2Kdf4",
  (xhr) => {console.log("success"); console.log(xhr.getAllResponseHeaders())},
  (xhr) => {console.log("fail")},
  [["Cookie", "SESS3d506d9bc855ddcd3287f9913e63767c=5nthk9qrkek76ftrnu48jq5g42; has_js=1; SESS903465f0adcfe01479847cb3d1bb9c52=3k7gr84qkdlpa1pvqatpveq262"]]
);

// [["Content-Security-Policy", "upgrade-insecure-requests"],
// ["Cookie", "SESS3d506d9bc855ddcd3287f9913e63767c=5nthk9qrkek76ftrnu48jq5g42; has_js=1; SESS903465f0adcfe01479847cb3d1bb9c52=3k7gr84qkdlpa1pvqatpveq262"]]
