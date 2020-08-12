// nodejs https module
import * as https from 'https';
// nodejs request module
import { createWriteStream } from 'fs';
// https://github.com/cheeriojs/cheerio
import { load as cheerioLoad } from 'cheerio';
// https://github.com/zemirco/json2csv
import { AsyncParser as json2csvAsyncParser } from 'json2csv';
// https://github.com/chrisweb/chrisweb-utilities.js
import { log } from 'chrisweb-utilities';
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
export function getPage(scrapRequestOptions = scrapOptions) {
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
                    resolve({ statusCode: response.statusCode, headers: response.headers, body: body });
                }
                else {
                    reject('Request failed. status: ' + response.statusCode + ', body: ' + body);
                }
            });
        });
        request.on('error', reject);
        request.end();
    });
}
export function scrapContent(page) {
    log('finished harvesting, now extracting data ...', 'fontColor:yellow');
    const $ = cheerioLoad(page);
    const $body = $('body');
    const $mainContent = $body.find('#hnmain');
    const $mainTable = $mainContent.find('table.itemlist > tbody');
    const $tableRows = $mainTable.children('tr');
    const articlesPromises = [];
    $tableRows.each(function (index, element) {
        const articlePromise = new Promise((resolve, reject) => {
            const $row = $(element);
            try {
                // top news item row
                if ($row.hasClass('athing')) {
                    const articleRank = parseInt($row.find('.rank').text());
                    const articleTitle = $row.find('.storylink').text();
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
    return Promise.all(articlesPromises).then((articlesParts) => {
        let article = {
            title: '',
            score: 0,
            rank: 0
        };
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
    });
}
export function saveAsCSV(articles) {
    // now we need to convert the \u2028 to \n
    // in json we used \u2028 because JSON.stringify won't escape it
    // but now we use \n before writing the csv to disk
    // TODO: would it be better to use os.EOL instead of hardcoded \n ?
    //csv = csv.replace(/\u2028/g, '\n');
    const outputPath = './output/hacker-news_articles.csv';
    const output = createWriteStream(outputPath, { encoding: 'utf8' });
    const fields = ['title', 'score', 'rank'];
    const json2csvOptions = { fields };
    const asyncParser = new json2csvAsyncParser(json2csvOptions);
    articles.forEach((article) => {
        asyncParser.input.push(JSON.stringify(article));
    });
    asyncParser.input.push(null);
    const parsingProcessor = asyncParser.toOutput(output);
    log('writing csv file done (you can find it in the folder called "csv")', 'fontColor:green');
    return parsingProcessor.promise();
}
//private sanitizeString = function santizeStringFunction(input: string) {
// 1) remove all spaces and tabs but keep \r and \n
// 2) remove multiple spaces and keep just one
// 3) trim removes spaces and line breaks if they are at the beginning or end,
// so no regex needed for this
//const inputNoSpace = input.replace(/[\t]/g, '').replace(/  +/g, ' ').trim();
// apple uses \r for linebreaks, linux \n and windows \r\n
// replace all \n, all \r and all \r\n by <br>
// replace multiple <br> with an optional space in front or after them with \u2028
// json stringify won't escape \u2028 (which is LS)
// if we would use \n it would get escaped
// below before writing the csv we will convert the \u2028 back to \n
//const output = inputNoSpace.replace(/(\r\n?|\n)/g, '<br>').replace(/( ?<br\s*\/?> ?){1,}/gi, '\u2028');
//return output;
//};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFja2VyLW5ld3Nfc2NyYXBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWJyYXJ5L2hhY2tlci1uZXdzX3NjcmFwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsc0JBQXNCO0FBQ3RCLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRS9CLHdCQUF3QjtBQUN4QixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFFdkMsdUNBQXVDO0FBQ3ZDLE9BQU8sRUFBRSxJQUFJLElBQUksV0FBVyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRTlDLHNDQUFzQztBQUN0QyxPQUFPLEVBQUUsV0FBVyxJQUFJLG1CQUFtQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTlELG9EQUFvRDtBQUNwRCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUE4QnpDLE1BQU0sWUFBWSxHQUFrQjtJQUNoQyxVQUFVLEVBQUU7UUFDUixLQUFLLEVBQUUsRUFBRTtLQUNaO0lBQ0QsTUFBTSxFQUFFLEtBQUs7SUFDYixHQUFHLEVBQUUsc0JBQXNCO0lBQzNCLElBQUksRUFBRSxHQUFHO0lBQ1QsSUFBSSxFQUFFLEdBQUc7SUFDVCxNQUFNLEVBQUUsS0FBSztDQUNoQixDQUFDO0FBRUYsTUFBTSxVQUFVLE9BQU8sQ0FBQyxzQkFBcUMsWUFBWTtJQUVyRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBRW5DLE1BQU0sY0FBYyxHQUFHO1lBQ25CLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxHQUFHO1lBQ2pDLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxJQUFJO1lBQzlCLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxJQUFJO1lBQzlCLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQyxNQUFNO1NBQ3JDLENBQUM7UUFFRixHQUFHLENBQUMsdUJBQXVCLEVBQUUsa0JBQWtCLENB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