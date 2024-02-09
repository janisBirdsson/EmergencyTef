function test(url) {
  console.log(url);
  fetch(url, { method: 'POST', redirect: 'manual'})
    .then(response => {
      // HTTP 301 response
      console.log("response.url =", response.url);
    })
    .catch(function(err) {
      console.info(err + " url: " + url);
    });
}

test("/playerpage.php?symbol=2Kdf4");
