import HackerNewsScraper from './library/hacker-news_scraper.js';
var hackerNewsScraper = new HackerNewsScraper();
hackerNewsScraper.execute().then(function (response) {
    console.log(response);
});
