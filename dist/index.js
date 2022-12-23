import * as https from 'https';
import { createWriteStream } from 'fs';
import { load } from 'cheerio';
import { AsyncParser } from 'json2csv';
import { log } from 'chrisweb-utilities';

// nodejs https module
const scrapOptions = {
    pagination: {
        count: 10,
    },
    saveAs: 'csv',
    url: 'news.ycombinator.com',
    port: 443,
    path: '/',
    method: 'GET',
};
function getPage(scrapRequestOptions = scrapOptions) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            hostname: scrapRequestOptions.url,
            port: scrapRequestOptions.port,
            path: scrapRequestOptions.path,
            method: scrapRequestOptions.method,
        };
        log('starting scrapping...', 'fontColor:yellow');
        const request = https.request(requestOptions, (response) => {
            let body = '';
            response.on('data', (chunk) => (body += chunk.toString()));
            response.on('error', reject);
            response.on('end', () => {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    log('scrapping done', 'fontColor:green');
                    resolve({ statusCode: response.statusCode, headers: response.headers, body });
                }
                else {
                    reject(new Error('Request failed. status: ' + response.statusCode + ', body: ' + body));
                }
            });
        });
        request.on('error', reject);
        request.end();
    });
}
async function scrapContent(page) {
    log('finished harvesting, now extracting data ...', 'fontColor:yellow');
    const $ = load(page);
    const $body = $('body');
    // the articles table (as of now) is in the thirs <tr>
    const $mainContent = $body.find('#hnmain tr:nth-child(3)');
    const $mainTable = $mainContent.find('table > tbody');
    const $tableRows = $mainTable.children('tr');
    const articlesPromises = [];
    $tableRows.each(function (index, element) {
        const articlePromise = new Promise((resolve, reject) => {
            const $row = $(element);
            //if (index > 3) return
            //console.log($row)
            try {
                // top news item row
                if ($row.hasClass('athing')) {
                    const articleRank = parseInt($row.find('.rank').text());
                    const articleTitle = $row.find('.titleline > a').text();
                    resolve({ rank: articleRank, title: articleTitle });
                }
                // second row with details
                if (!$row.hasClass('athing') && !$row.hasClass('spacer')) {
                    const articleScore = parseInt($row.find('.score').text());
                    if (isNaN(articleScore)) {
                        resolve();
                    }
                    resolve({ score: articleScore });
                }
                // thirs row which is a space => skip
                if ($row.hasClass('spacer')) {
                    // skip
                }
                resolve();
            }
            catch (error) {
                reject(error);
            }
        });
        articlesPromises.push(articlePromise);
    });
    const articles = [];
    const articlesParts = await Promise.all(articlesPromises);
    let article = {
        title: '',
        score: 0,
        rank: 0
    };
    //console.log(articlesParts)
    for (const articleParts of articlesParts) {
        if (articleParts === undefined) {
            continue;
        }
        // check if our object has the title else it is the one with score
        if (articleParts.title) {
            article.title = articleParts.title;
            article.rank = articleParts.rank;
        }
        else {
            article.score = articleParts.score;
            articles.push(article);
            article = {
                title: '',
                score: 0,
                rank: 0
            };
        }
    }
    log('extracting done', 'fontColor:green');
    return articles;
}
function saveAsCSV(articles) {
    // now we need to convert the \u2028 to \n
    // in json we used \u2028 because JSON.stringify won't escape it
    // but now we use \n before writing the csv to disk
    // TODO: would it be better to use os.EOL instead of hardcoded \n ?
    //csv = csv.replace(/\u2028/g, '\n');
    const outputPath = './output/hacker-news_articles.csv';
    const output = createWriteStream(outputPath, { encoding: 'utf8' });
    // note to self: careful, the following field names need to match the object property names!!!
    const fields = Object.getOwnPropertyNames(articles[0]);
    const json2csvOptions = { fields };
    // eslint-disable-next-line new-cap
    const asyncParser = new AsyncParser(json2csvOptions);
    articles.forEach((article) => {
        asyncParser.input.push(JSON.stringify(article));
    });
    asyncParser.input.push(null);
    const parsingProcessor = asyncParser.toOutput(output);
    log('writing csv file done (you can find it in the folder called "output")', 'fontColor:green');
    return parsingProcessor.promise();
}
/*private sanitizeString = function santizeStringFunction(input: string) {

    // 1) remove all spaces and tabs but keep \r and \n
    // 2) remove multiple spaces and keep just one
    // 3) trim removes spaces and line breaks if they are at the beginning or end,
    // so no regex needed for this
    const inputNoSpace = input.replace(/[\t]/g, '').replace(/  +/g, ' ').trim();

    // apple uses \r for linebreaks, linux \n and windows \r\n
    // replace all \n, all \r and all \r\n by <br>
    // replace multiple <br> with an optional space in front or after them with \u2028
    // json stringify won't escape \u2028 (which is LS)
    // if we would use \n it would get escaped
    // below before writing the csv we will convert the \u2028 back to \n
    const output = inputNoSpace.replace(/(\r\n?|\n)/g, '<br>').replace(/( ?<br\s*\/?> ?){1,}/gi, '\u2028');

    return output

}*/

// example 1: grab top hacker news articles, extract the title, rank and score, save data as csv file
const data = await getPage();
//console.log(data)
const articles = await scrapContent(data.body);
//console.log(articles)
if (articles.length > 0) {
    saveAsCSV(articles).then((response) => {
        console.log(response);
    }).catch((error) => {
        console.log(error);
    });
}
else {
    console.log('no scrapped articles found');
}
/*
// example 2: takes a local document that got downloaded previously and parses it based on defined rules
import { getDocument, scrapContent, saveAsCSV } from './library/local_document_sraper'

const data = await getDocument()

//console.log(data)

const entities = await scrapContent(data)

//console.log(entities)

if (entities.length > 0) {

    saveAsCSV(entities).then((response) => {
        console.log(response)
    }).catch((error) => {
        console.log(error)
    })

} else {
    console.log('no scrapped articles found')
}
*/
/*
// example 3: grad the wikipedia page containing the countries list, downloads each flag image and creates a csv with a google sheet image formula to display the flags
// note: the flags displayed in the google sheet use the wikipedia URL, to use the downloaded images instead you need to host them on a server and alter the image url to match your server address

// https://github.com/chrisweb/chrisweb-utilities.js
import { filterAlphaNumericPlus } from 'chrisweb-utilities'

import { getPage, scrapContent, saveAsCSV, fetchImage } from './library/wikipedia_with_images_sraper'

const data = await getPage()

//console.log(data)

const entities = await scrapContent(data.body)

//console.log(entities)

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
*/
//# sourceMappingURL=index.js.map
