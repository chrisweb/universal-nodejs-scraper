/*
// example 1: grab top hacker news articles, extract the title, rank and score, save data as csv file
import { getPage, scrapContent, saveAsCSV } from './library/hacker-news_scraper';

getPage().then((data) => {

    //console.log(data);

    const articlesPromise = scrapContent(data.body);

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
/*
// example 2: takes a local document that got downloaded previously and parses it based on defined rules
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
*/

// example 3: grad the wikipedia page containing the countries list, downloads each flag image and creates a csv with a google sheet image formula to display the flags
// note: the flags displayed in the google sheet use the wikipedia URL, to use the downloaded images instead you need to host them on a server and alter the image url to match your server address

// https://github.com/chrisweb/chrisweb-utilities.js
import { filterAlphaNumericPlus } from 'chrisweb-utilities';

import { getPage, scrapContent, saveAsCSV, fetchImage } from './library/wikipedia_with_images_sraper';

getPage().then((data) => {

    //console.log(data);

    const entitiesPromise = scrapContent(data.body);

    entitiesPromise.then((entities) => {

        //console.log(entities);

        // create the csv file
        saveAsCSV(entities).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.log(error);
        });

        entities.forEach((entity) => {

            const filteredName = filterAlphaNumericPlus(entity.name, '') as string;

            const fetchImagePromise = fetchImage(entity.image_url, filteredName, 'png');

            fetchImagePromise.then(() => {
                return;
            }).catch((error) => {
                console.log(error);
            });

        });

    }).catch((error) => {
        console.log(error);
    });

});
