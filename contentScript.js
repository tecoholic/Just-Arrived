let seenTweets = [];

// Date to timestamp - thanks Stack overflow
Date.prototype.yyyymmdd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    this.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
  ].join("");
};

// load all the tweets that has been seen so far that day
let today = new Date().yyyymmdd();
chrome.storage.local.get(today, function (store) {
  if (!!store[today]) {
    seenTweets = JSON.parse(store[today]);
  } else {
    chrome.storage.local.clear();
  }
});

function listTweetIds() {
  let tweets = document.querySelectorAll("article");
  let reg = new RegExp(/\/*\/status\/(?<tweetId>[0-9]+)/);

  let tweetIds = [];
  tweets.forEach(function (tweet) {
    let links = tweet.querySelectorAll("a");
    for (let i = 0; i < links.length; i++) {
      let href = links[i].getAttribute("href");
      let matches = href.match(reg);
      if (!matches) {
        continue;
      }
      if (seenTweets.indexOf(matches.groups.tweetId) !== -1) {
        tweet.setAttribute("style", "opacity: 50%;");
      } else {
        tweetIds.push(matches.groups.tweetId);
      }
      return;
    }
  });

  let store = {};
  store[today] = JSON.stringify(seenTweets.concat(tweetIds));
  chrome.storage.local.set(store);
}

let timer = setInterval(listTweetIds, 2000);
