// example 1: grab top hacker news articles, extract the title, rank and score, save data as csv file
/*
import { getPage, scrapContent, saveAsCSV } from './library/hacker-news_scraper';

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
*/

// example 2
import { getDocument, scrapContent, saveAsCSV } from './library/local_document_sraper';

getDocument().then((data) => {

    //console.log(response);

    const entitiesPromise = scrapContent(data);

    entitiesPromise.then((entities) => {

        //console.log(articles);

        saveAsCSV(entities).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.log(error);
        });

    }).catch((error) => {
        console.log(error);
    });

});
