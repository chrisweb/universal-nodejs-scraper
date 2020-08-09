// nodejs request module
import * as https from 'https';

// nodejs request module
import { createWriteStream } from 'fs';

// https://github.com/cheeriojs/cheerio
//import cheerio from 'cheerio'
//import * as cheerio from 'cheerio';
//const load = cheerio.load;

import { load } from 'cheerio';

// https://github.com/zemirco/json2csv
//import * as json2csv from 'json2csv';
import { AsyncParser } from 'json2csv';

//import json2csv from 'json2csv';

//import pkg from 'json2csv';
//const { AsyncParser } = pkg;

// https://github.com/chrisweb/chrisweb-utilities.js
//import * as utilities from 'chrisweb-utilities';
//const log = utilities.log;

import { log } from 'chrisweb-utilities';

interface IScrapOptions {
    pagination: {
        count: number;
    };
    save: string;
    url: string;
    port: number;
    path: string;
    method: string;
}

interface IScrapResponse {
    statusCode: number;
    headers: unknown;
    body: string;
}

interface IArticlePartTitle {
    title: string;
    rank: number;
}

interface IArticlePartScore {
    score: number;
}

interface IArticle extends IArticlePartTitle, IArticlePartScore {}

const scrapOptions: IScrapOptions = {
    pagination: {
        count: 10,
    },
    save: 'csv',
    url: 'news.ycombinator.com',
    port: 443,
    path: '/',
    method: 'GET',
};

export function getPage(scrapRequestOptions: IScrapOptions = scrapOptions): Promise<IScrapResponse> {

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
                } else {
                    reject('Request failed. status: ' + response.statusCode + ', body: ' + body);
                }

            });
        });

        request.on('error', reject);
        request.end();

    });

}

export function  scrapContent(page: string): Promise<IArticle[]> {

    log('finished harvesting, now extracting data ...', 'fontColor:yellow');

    const $ = load(page);

    const $body = $('body');
    const $mainContent = $body.find('#hnmain');
    const $mainTable = $mainContent.find('table.itemlist > tbody');
    const $tableRows = $mainTable.children('tr');

    const articlesPromises: Promise<{ rank: number, title: string } | { score: number } | undefined>[] = [];

    $tableRows.each(function (index, element) {

        const articlePromise: Promise<{ rank: number, title: string } | { score: number } | undefined> = new Promise((resolve, reject) => {

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

            } catch (error) {
                reject(error);
            }

        });

        articlesPromises.push(articlePromise);

    });

    const articles: IArticle[] = [];

    return Promise.all(articlesPromises).then((articlesParts) => {

        let article: IArticle = {
            title: '',
            score: 0,
            rank: 0
        };

        for (const articleParts of articlesParts) {

            if (articleParts === undefined) {
                continue;
            }

            // check if our object has the title else it is the one with score
            if ((articleParts as IArticlePartTitle).title) {
                article.title = (articleParts as IArticlePartTitle).title;
                article.rank = (articleParts as IArticlePartTitle).rank;
            } else {
                article.score = (articleParts as IArticlePartScore).score;
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

export function saveAsCSV(articles: IArticle[]): Promise<string> {

    // now we need to convert the \u2028 to \n
    // in json we used \u2028 because JSON.stringify won't escape it
    // but now we use \n before writing the csv to disk
    // TODO: would it be better to use os.EOL instead of hardcoded \n ?
    //csv = csv.replace(/\u2028/g, '\n');

    const outputPath = './csv/hacker-news_articles.csv';
    const output = createWriteStream(outputPath, { encoding: 'utf8' });
    const fields = ['title', 'score', 'rank'];
    const json2csvOptions = { fields };
    const asyncParser = new AsyncParser(json2csvOptions);

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
