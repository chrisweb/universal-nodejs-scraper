// nodejs filesystem module
import { readFile, createWriteStream } from 'fs'

// nodejs https module
import * as https from 'https'

// https://github.com/cheeriojs/cheerio
import { load as cheerioLoad } from 'cheerio'

// https://github.com/zemirco/json2csv
import { AsyncParser as json2csvAsyncParser } from 'json2csv'

// https://github.com/chrisweb/chrisweb-utilities.js
import { log, randomInteger, sleep } from 'chrisweb-utilities'

interface IScrapOptions {
    saveAs: string
    url: string
    port: number
    path: string
    method: string
}

interface IScrapResponse {
    statusCode: number
    headers: unknown
    body: string
}

interface IEntity {
    [key: string]: string
}

const scrapOptions: IScrapOptions = {
    saveAs: 'csv',
    url: 'en.wikipedia.org',
    port: 443,
    path: '/wiki/List_of_countries_by_population_(United_Nations)',
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

export async function scrapContent (data: string): Promise<IEntity[]> {

    log('finished harvesting, now extracting data ...', 'fontColor:yellow')

    const $ = cheerioLoad(data)

    const $items = $('table > tbody')
    const $tableRows = $items.children('tr')

    //console.log($tableRows)

    const entitiesPromises: Promise<IEntity>[] = []

    $tableRows.each(function (index, element) {

        const rowIndex = index + 1
        const $row = $(element)

        const entitiesPromise: Promise<IEntity> = new Promise((resolve, reject) => {

            try {

                const $firstColumn = $row.find('td').first()
                const countryName = $firstColumn.find('a').attr('title')
                const imageUrl = 'https:' + $firstColumn.find('img').attr('src')

                // https://support.google.com/docs/answer/3093333?hl=en
                const imageGoogleSheetFormula = '=IMAGE(C' + rowIndex + ',4,15,23)'

                resolve({ image: imageGoogleSheetFormula, name: countryName, image_url: imageUrl })

            } catch (error) {
                reject(error)
            }

        })

        if ($row.find('td').length !== 0) {
            entitiesPromises.push(entitiesPromise)
        }

    })

    const entitiesArray = await Promise.all(entitiesPromises)
    log('extracting done', 'fontColor:green')
    return entitiesArray

}

export function fetchImage (url: string, filename: string, extension: string, delayTime = 0): Promise<void> {

    return new Promise((resolve, reject) => {

        const imageFullName = filename + '.' + extension
        const localPath = './output/images/' + imageFullName
        const minWaitTime = delayTime + 1000
        const maxWaitTime = delayTime + 5000

        const randomWaitAmount = randomInteger(minWaitTime, maxWaitTime)

        // check if image doesn't exist already
        readFile(localPath, function (error) {

            // error = file doesn't yet exist
            if (error) {

                // wait for delay + 1 to 5 seconds before fetching
                // to not overload the server we are fetching from
                sleep(randomWaitAmount).then(() => {

                    log('fetching image: ' + imageFullName, 'fontColor:blue')

                    https.get(url, (response) => {

                        const localImageStream = createWriteStream(localPath)

                        response.pipe(localImageStream)

                        resolve()

                    }).on('error', (error) => {
                        reject(error)
                    })

                }).catch(reject)

            } else {
                resolve()
            }

        })

    })

}

export function saveAsCSV (entities: IEntity[]): Promise<string> {

    const outputPath = './output/wikipedia.csv'
    const output = createWriteStream(outputPath, { encoding: 'utf8' })

    // note to self: careful, the following field names need to match the object property names!!!
    const fields = Object.getOwnPropertyNames(entities[0])
    const json2csvOptions = { fields }

    // eslint-disable-next-line new-cap
    const asyncParser = new json2csvAsyncParser(json2csvOptions)

    entities.forEach((entity) => {
        asyncParser.input.push(JSON.stringify(entity))
    })

    asyncParser.input.push(null)

    const parsingProcessor = asyncParser.toOutput(output)

    log('writing csv file done (you can find it in the folder called "output")', 'fontColor:green')

    return parsingProcessor.promise()

}
