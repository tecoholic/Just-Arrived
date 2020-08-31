let seenTweets = [];
let unSeenTweets = [];

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
      } else if (unSeenTweets.indexOf(matches.groups.tweetId) === -1) {
        unSeenTweets.push(matches.groups.tweetId);
      }
      return;
    }
  });

  let store = {};
  store[today] = JSON.stringify(seenTweets.concat(unSeenTweets));
  chrome.storage.local.set(store);
}

/**
 * Show a small indicator to denote that Just Arrived is loaded into the page
 */

function showIndicator() {
  const container = document.createElement("div")
  container.setAttribute("id", "just-arrived-notifier")
  container.setAttribute("style", "position: fixed; top: 10px; right: 10px; padding: 0.5rem; border: 1px solid #29B6F6; background-color: #E1F5FE; z-index: 100; font-size: xx-small;")
  const text = document.createTextNode("Just Arrived")
  container.appendChild(text);
  let body = document.querySelector("body");
  body.appendChild(container);
  setTimeout(removeIndicator, 15000);
}

function removeIndicator() {
  let body = document.querySelector("body");
  body.querySelector("#just-arrived-notifier").remove();
}


let timer = setInterval(listTweetIds, 2000);
showIndicator();

