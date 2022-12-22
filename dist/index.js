import { log, randomInteger, sleep, filterAlphaNumericPlus } from 'chrisweb-utilities';
import { readFile, createWriteStream } from 'fs';
import * as https from 'https';
import { load } from 'cheerio';
import { AsyncParser } from 'json2csv';

// nodejs request module
const scrapOptions = {
    saveAs: 'csv',
    url: 'en.wikipedia.org',
    port: 443,
    path: '/wiki/List_of_countries_by_population_(United_Nations)',
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
async function scrapContent(data) {
    log('finished harvesting, now extracting data ...', 'fontColor:yellow');
    const $ = load(data);
    const $items = $('table > tbody');
    const $tableRows = $items.children('tr');
    console.log($tableRows);
    const entitiesPromises = [];
    $tableRows.each(function (index, element) {
        const rowIndex = index + 1;
        const $row = $(element);
        const entitiesPromise = new Promise((resolve, reject) => {
            try {
                const $firstColumn = $row.find('td').first();
                const countryName = $firstColumn.find('a').attr('title');
                const imageUrl = 'https:' + $firstColumn.find('img').attr('src');
                // https://support.google.com/docs/answer/3093333?hl=en
                const imageGoogleSheetFormula = '=IMAGE(C' + rowIndex + ',4,15,23)';
                resolve({ image: imageGoogleSheetFormula, name: countryName, image_url: imageUrl });
            }
            catch (error) {
                reject(error);
            }
        });
        if ($row.find('td').length !== 0) {
            entitiesPromises.push(entitiesPromise);
        }
    });
    const entitiesArray = await Promise.all(entitiesPromises);
    log('extracting done', 'fontColor:green');
    return entitiesArray;
}
function fetchImage(url, filename, extension, delayTime = 0) {
    return new Promise((resolve, reject) => {
        const imageFullName = filename + '.' + extension;
        const localPath = './output/images/' + imageFullName;
        const minWaitTime = delayTime + 1000;
        const maxWaitTime = delayTime + 5000;
        const randomWaitAmount = randomInteger(minWaitTime, maxWaitTime);
        // check if image doesn't exist already
        readFile(localPath, function (error) {
            // error = file doesn't yet exist
            if (error) {
                // wait for delay + 1 to 5 seconds before fetching
                // to not overload the server we are fetching from
                sleep(randomWaitAmount).then(() => {
                    log('fetching image: ' + imageFullName, 'fontColor:blue');
                    https.get(url, (response) => {
                        const localImageStream = createWriteStream(localPath);
                        response.pipe(localImageStream);
                        resolve();
                    }).on('error', (error) => {
                        reject(error);
                    });
                }).catch(reject);
            }
            else {
                resolve();
            }
        });
    });
}
function saveAsCSV(entities) {
    const outputPath = './output/wikipedia.csv';
    const output = createWriteStream(outputPath, { encoding: 'utf8' });
    // note to self: careful, the following field names need to match the object property names!!!
    const fields = Object.getOwnPropertyNames(entities[0]);
    const json2csvOptions = { fields };
    // eslint-disable-next-line new-cap
    const asyncParser = new AsyncParser(json2csvOptions);
    entities.forEach((entity) => {
        asyncParser.input.push(JSON.stringify(entity));
    });
    asyncParser.input.push(null);
    const parsingProcessor = asyncParser.toOutput(output);
    log('writing csv file done (you can find it in the folder called "output")', 'fontColor:green');
    return parsingProcessor.promise();
}

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
const data = await getPage();
//console.log(data)
const entities = await scrapContent(data.body);
if (entities.length > 0) {
    // create the csv file
    saveAsCSV(entities).then((response) => {
        console.log(response);
    }).catch((error) => {
        console.log(error);
    });
    entities.forEach(async (entity, index) => {
        const filteredName = filterAlphaNumericPlus(entity.name, '');
        const delayTime = index * 1000;
        try {
            await fetchImage(entity.image_url, filteredName, 'png', delayTime);
        }
        catch (error) {
            console.log(error);
        }
    });
}
else {
    console.log('no scrapped entities found');
}
//# sourceMappingURL=index.js.map
