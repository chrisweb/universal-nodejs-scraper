// nodejs https module
import * as https from 'https'

// nodejs request module
import { createWriteStream } from 'fs'

// https://github.com/cheeriojs/cheerio
import { load as cheerioLoad } from 'cheerio'

// https://github.com/zemirco/json2csv
import { AsyncParser as json2csvAsyncParser } from 'json2csv'

// https://github.com/chrisweb/chrisweb-utilities.js
import { log } from 'chrisweb-utilities'

interface IScrapOptions {
    pagination: {
        count: number;
    };
    saveAs: string;
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

interface IArticle extends IArticlePartTitle, IArticlePartScore { }

const scrapOptions: IScrapOptions = {
    pagination: {
        count: 10,
    },
    saveAs: 'csv',
    url: 'news.ycombinator.com',
    port: 443,
    path: '/',
    method: 'GET',
}

export function getPage (scrapRequestOptions: IScrapOptions = scrapOptions): Promise<IScrapResponse> {

    return new Promise((resolve, reject) => {

        const requestOptions = {
            hostname: scrapRequestOptions.url,
            port: scrapRequestOptions.port,
            path: scrapRequestOptions.path,
            method: scrapRequestOptions.method,
        }

        log('starting scrapping...', 'fontColor:yellow')

        const request = https.request(requestOptions, (response) => {

            let body = ''
            response.on('data', (chunk) => (body += chunk.toString()))
            response.on('error', reject)
            response.on('end', () => {

                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    log('scrapping done', 'fontColor:green')
                    resolve({ statusCode: response.statusCode, headers: response.headers, body })
                } else {
                    reject(new Error('Request failed. status: ' + response.statusCode + ', body: ' + body))
                }

            })
        })

        request.on('error', reject)
        request.end()

    })

}

export async function scrapContent (page: string): Promise<IArticle[]> {

    log('finished harvesting, now extracting data ...', 'fontColor:yellow')

    const $ = cheerioLoad(page)

    const $body = $('body')
    // the articles table (as of now) is in the thirs <tr>
    const $mainContent = $body.find('#hnmain tr:nth-child(3)')
    const $mainTable = $mainContent.find('table > tbody')
    const $tableRows = $mainTable.children('tr')

    const articlesPromises: Promise<{ rank: number, title: string } | { score: number } | void>[] = []

    $tableRows.each(function (index, element) {

        const articlePromise: Promise<{ rank: number, title: string } | { score: number } | void> = new Promise((resolve, reject) => {

            const $row = $(element)

            //if (index > 3) return
            //console.log($row)

            try {

                // top news item row
                if ($row.hasClass('athing')) {
                    const articleRank = parseInt($row.find('.rank').text())
                    const articleTitle = $row.find('.titleline > a').text()
                    resolve({ rank: articleRank, title: articleTitle })
                }

                // second row with details
                if (!$row.hasClass('athing') && !$row.hasClass('spacer')) {
                    const articleScore = parseInt($row.find('.score').text())
                    if (isNaN(articleScore)) {
                        resolve()
                    }
                    resolve({ score: articleScore })
                }

                // thirs row which is a space => skip
                if ($row.hasClass('spacer')) {
                    // skip
                }

                resolve()

            } catch (error) {
                reject(error)
            }

        })

        articlesPromises.push(articlePromise)

    })

    const articles: IArticle[] = []

    const articlesParts = await Promise.all(articlesPromises)

    let article: IArticle = {
        title: '',
        score: 0,
        rank: 0
    }

    //console.log(articlesParts)

    for (const articleParts of articlesParts) {

        if (articleParts === undefined) {
            continue
        }

        // check if our object has the title else it is the one with score
        if ((articleParts as IArticlePartTitle).title) {
            article.title = (articleParts as IArticlePartTitle).title
            article.rank = (articleParts as IArticlePartTitle).rank
        } else {
            article.score = (articleParts as IArticlePartScore).score
            articles.push(article)
            article = {
                title: '',
                score: 0,
                rank: 0
            }
        }

    }
    log('extracting done', 'fontColor:green')
    return articles
}

export function saveAsCSV (articles: IArticle[]): Promise<string> {

    // now we need to convert the \u2028 to \n
    // in json we used \u2028 because JSON.stringify won't escape it
    // but now we use \n before writing the csv to disk
    // TODO: would it be better to use os.EOL instead of hardcoded \n ?
    //csv = csv.replace(/\u2028/g, '\n');

    const outputPath = './output/hacker-news_articles.csv'
    const output = createWriteStream(outputPath, { encoding: 'utf8' })
    // note to self: careful, the following field names need to match the object property names!!!
    const fields = Object.getOwnPropertyNames(articles[0])
    const json2csvOptions = { fields }
    // eslint-disable-next-line new-cap
    const asyncParser = new json2csvAsyncParser(json2csvOptions)

    articles.forEach((article) => {
        asyncParser.input.push(JSON.stringify(article))
    })

    asyncParser.input.push(null)

    const parsingProcessor = asyncParser.toOutput(output)

    log('writing csv file done (you can find it in the folder called "output")', 'fontColor:green')

    return parsingProcessor.promise()

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
