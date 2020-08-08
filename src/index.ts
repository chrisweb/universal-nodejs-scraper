import HackerNewsScraper from './library/hacker-news_scraper.js';

const hackerNewsScraper = new HackerNewsScraper();

hackerNewsScraper.execute().then((response) => {

    console.log(response);

});
