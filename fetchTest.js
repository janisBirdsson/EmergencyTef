function test(url, redi) {
  console.log(url);
  fetch(url, { method: 'POST', redirect: redi})
    .then(response => {
      // HTTP 301 response
      console.log("response.url =", response.url);
    })
    .catch(function(err) {
      console.info(err + " url: " + url);
    });
}

test("/machine/playerpage.php?symbol=2Kdf4", "follow");
