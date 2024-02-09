function test(url, mode, redi) {
  console.log(url);
  fetch(url, { method: mode, redirect: redi})
    .then(response => {
      // HTTP 301 response
      console.log("response.url =", response.url + "\n");
      console.log("headers: ");
      console.log(response.headers);
      console.log("\n");
      console.log("pairs: ");
      response.headers.forEach(function(val, key) { console.log(key + ' -> ' + val); });
      console.log("\n");
    })
    .catch(function(err) {
      console.info(err + " url: " + url);
    });
}

test("/machine/playerpage.php?symbol=2Kdf4", "HEAD", "manual");
