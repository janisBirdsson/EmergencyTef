function test(url, redi) {
  console.log(url);
  fetch(url, { method: 'POST', redirect: redi})
    .then(response => {
      // HTTP 301 response
      console.log("response.url =", response.url + "\n");
      console.log("headsers: " + response.headers + "\n");
      response.headers.forEach(function(val, key) { console.log(key + ' -> ' + val); });
    })
    .catch(function(err) {
      console.info(err + " url: " + url);
    });
}

test("/machine/playerpage.php?symbol=2Kdf4", "manual");
