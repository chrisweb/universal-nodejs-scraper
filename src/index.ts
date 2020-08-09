import { getPage, scrapContent, saveAsCSV } from './library/hacker-news_scraper.js';

getPage().then((response) => {

    //console.log(response);

    const articlesPromise = scrapContent(response.body);

    articlesPromise.then((articles) => {

        //console.log(articles);

        saveAsCSV(articles).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.log(error);
        });

    }).catch((error) => {
        console.log(error);
    });

});
