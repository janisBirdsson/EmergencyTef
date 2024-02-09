function requestHttp(method, url, successCallback, errorCallback, resquestHeaders = [], noCache = false){
  let xhr = null;
  if(window.XMLHttpRequest){
    xhr = new XMLHttpRequest();
  }else{
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }
  
  // xhr.onreadystatechange = () => {
  //   try{
  //     if(xhr.readyState == 4){
  //       var status = xhr.status;
  //       if(status >= 200 && status < 400 && xhr.HEADERS_RECEIVED){
  //         successCallback(xhr);
  //       }else{
  //         console.log("Problem connecting to " + url + ". Status: " + status);
  //         errorCallback(xhr);
  //       }
  //     }
  //   }catch(e){
  //     console.log(e);
  //   }
  // };
  xhr.onload = () => {
    console.log(method + "onload " + xhr.getResponseHeader('Location'));
  }
  xhr.onreadystatechange = () => {
    console.log(method + " onreadystatechange " + xhr.getResponseHeader('Location'));
  }
  xhr.ontimeout = () => {
    console.log("Connection to " + url + "Timed out.");
    errorCallback(xhr);
  };
  xhr.open(method, url, true);
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

console.log("Test!\n");
const target = "https://" + window.location.hostname.substring(0, 29);
// console.log("Host: \"" + target + "\"\n");




function listCookies() {
  var theCookies = document.cookie.split(';');
  var aString = '';
  for (var i = 1 ; i <= theCookies.length; i++) {
      aString += i + ' ' + theCookies[i-1] + "\n";
  }
  return aString;
}

function getPlayers(successCallback) {
  const url = "/machine/playerstatus.php?action=get";
  const method = "GET";
  const resquestHeaders = [];
  const noCache = true;
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
          console.log("getPlayers " + xhr.getAllResponseHeaders());
          successCallback(xhr);
        }else{
          console.log("Problem connecting to " + url + ". Status: " + status);
        }
      }
    }catch(e){
      console.log(e);
    }
  };
  xhr.ontimeout = () => {
    console.log("Connection to " + url + "Timed out.");
  };
  xhr.open(method, url, true);
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

function getPlayerPageURL(picto, successCallback) {
  const url = "/machine/playerpage.php?symbol=" + picto;// + "/";
  const method = "HEAD";

  // let resquestHeaders = [["Content-Security-Policy", "upgrade-insecure-requests"]];

  let xhr = null;
  if(window.XMLHttpRequest){
    xhr = new XMLHttpRequest();
  }else{
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xhr.onload = () => {
    console.log(method + " onload " + xhr.getResponseHeader('Location'));
    console.log("responseURL " + xhr.responseURL);
  }

  xhr.onreadystatechange = () => {
    console.log("getPlayerPageURL getAllResponseHeaders " + xhr.getAllResponseHeaders());
    console.log("getPlayerPageURL " + xhr.getResponseHeader('Location'));
    console.log("responseURL " + xhr.responseURL);
    successCallback(xhr);
  }
  
  xhr.ontimeout = () => {
    console.log("Connection to " + url + "Timed out.");
  };
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Security-Policy", "upgrade-insecure-requests");
  xhr.setRequestHeader("Upgrade-Insecure-Requests", "1");
  // console.log(resquestHeaders);
  // resquestHeaders.forEach(pair => {
  //   console.log(pair[0] + ":" + pair[1]);
  //   xhr.setRequestHeader(pair[0], pair[1]);
  // });
  xhr.responseType = 'document';
  //xhr.timeout = 2 * 1000;
  try {
    xhr.send();
  } catch(e) {
    console.log(e);
  }
}

// either cookie except has_js works
// TODO somethig about xhr.accept("text") vs "document"

function getPlayerPage(name, successCallback) {
  const url = "/community/" + name;
  const method = "GET";
  
  // let theCookies = document.cookie.split(';');
  // theCookies.forEach(cookie => {
  //   resquestHeaders.push(["Cookie", cookie]);
  // });
  let resquestHeaders = [["Cookie", document.cookie]];
  console.log(resquestHeaders);

  const noCache = true;
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
          console.log("getPlayerPage " + xhr.getAllResponseHeaders());
          successCallback(xhr);
        }else{
          console.log("Problem connecting to " + url + ". Status: " + status);
        }
      }
    }catch(e){
      console.log(e);
    }
  };
  xhr.ontimeout = () => {
    console.log("Connection to " + url + "Timed out.");
  };
  xhr.open(method, url, true);
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

function addPlayer(url) {
  if(url != null) {
    console.log(url);
    const name = url.substring(39, url.length);
    getPlayerPage(
      name,
      (xhr) => {
        console.log(xhr.responseText);
      }
    );
  }
}

function updateMap(xhr) {
  let playerListElem = document.createElement("html");
  playerListElem.innerHTML = xhr.responseText;
  const players = playerListElem.querySelectorAll("player");
  const picto = players[0].getAttribute("pictogram");
  console.log(picto);
  getPlayerPageURL(picto,
    (xhr) => {
      console.log("Location: " + xhr.getResponseHeader('Location'));
      addPlayer(xhr.getResponseHeader('Location'));
    }
  );
}

window.location = "http://www.endlessforest.org/community/node/114789"; 

getPlayers((xhr) => {
  updateMap(xhr);
});

// [["Content-Security-Policy", "upgrade-insecure-requests"],
