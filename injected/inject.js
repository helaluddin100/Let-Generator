!function () {
  function isMapsSearchLikeUrl(url) {
    if (!url || typeof url !== "string") return false;
    if (url.indexOf("/search") > -1) return true;
    var u = url.toLowerCase();
    return u.indexOf("google.") > -1 && u.indexOf("/maps") > -1 && u.indexOf("search") > -1;
  }
  function dispatchSearchApi(url, data) {
    if (!isMapsSearchLikeUrl(url)) return;
    try {
      window.dispatchEvent(new CustomEvent("GOOGLE_SEARCH_API_gtbakz", { detail: { url: url, data: data } }));
    } catch (e) {}
  }
  function onXhrDone(xhr) {
    if (!xhr || xhr.readyState !== 4 || xhr.status !== 200) return;
    dispatchSearchApi(xhr.responseURL, xhr.response);
  }
  console.log("----maps-scraper inject (xhr+fetch)----");
  try {
    window.msnetah.hook({
      onreadystatechange: function (xhr) { onXhrDone(xhr); return false; },
      onload: function (xhr) { onXhrDone(xhr); return false; },
      open: function () { return false; }
    });
  } catch (e) {
    console.error("GML xhr hook error=", e);
  }
  try {
    var nativeFetch = window.fetch;
    if (typeof nativeFetch === "function") {
      window.fetch = function () {
        var args = arguments;
        return nativeFetch.apply(this, args).then(function (response) {
          try {
            if (response && response.ok && response.url && isMapsSearchLikeUrl(response.url)) {
              response.clone().text().then(function (text) {
                dispatchSearchApi(response.url, text);
              });
            }
          } catch (err) {}
          return response;
        });
      };
    }
  } catch (e2) {
    console.error("GML fetch hook error=", e2);
  }
}();
