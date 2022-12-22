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
import { filterAlphaNumericPlus } from 'chrisweb-utilities'

import { getPage, scrapContent, saveAsCSV, fetchImage } from './library/wikipedia_with_images_sraper'

const data = await getPage()

//console.log(data)

const entities = await scrapContent(data.body)

if (entities.length > 0) {

    // create the csv file
    saveAsCSV(entities).then((response) => {
        console.log(response)
    }).catch((error) => {
        console.log(error)
    })

    entities.forEach(async (entity, index) => {

        const filteredName = filterAlphaNumericPlus(entity.name, '') as string
        const delayTime = index * 1000

        try {
            await fetchImage(entity.image_url, filteredName, 'png', delayTime)
        } catch (error) {
            console.log(error)
        }

    })

} else {
    console.log('no scrapped entities found')
}
