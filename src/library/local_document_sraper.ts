// nodejs request module
import { readFile, createWriteStream } from 'fs'

// nodejs path module
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// https://github.com/cheeriojs/cheerio
import { load as cheerioLoad } from 'cheerio'

// https://github.com/zemirco/json2csv
import { AsyncParser as json2csvAsyncParser } from 'json2csv'

// https://github.com/chrisweb/chrisweb-utilities.js
import { log } from 'chrisweb-utilities'

interface IScrapOptions {
    saveAs: string
    documentName: string
}

interface IEntity {
    first: string
    second: string
    third: string
}

const __dirname = dirname(fileURLToPath(import.meta.url))

const scrapOptions: IScrapOptions = {
    saveAs: 'csv',
    documentName: 'local_document.html',
}

export function getDocument (scrapRequestOptions: IScrapOptions = scrapOptions): Promise<string> {

    return new Promise((resolve, reject) => {

        log('starting scrapping...', 'fontColor:yellow')

        const filePath = join(__dirname, '../input/', scrapRequestOptions.documentName)

        readFile(filePath, { encoding: 'utf-8' }, function (error, data) {

            if (error) {
                reject(error)
            }

            resolve(data)

        })

    })

}

export async function scrapContent (data: string): Promise<IEntity[]> {

    log('finished harvesting, now extracting data ...', 'fontColor:yellow')

    const $ = cheerioLoad(data)

    const $body = $('body')
    const $mainTable = $body.find('table')
    const $mainTableBody = $mainTable.find('tbody')
    const $tableRows = $mainTableBody.children('tr')

    //console.log($tableRows)

    const entitiesPromises: Promise<IEntity>[] = []

    $tableRows.each(function (index, element) {

        const entitiesPromise: Promise<IEntity> = new Promise((resolve, reject) => {

            const $row = $(element)
            try {

                const first = $row.find('.left').text()
                const second = $row.find('.middle').text()
                const third = $row.find('.right').text()

                resolve({ first, second, third })

            } catch (error) {
                reject(error)
            }

        })

        entitiesPromises.push(entitiesPromise)

    })

    const entitiesArray = await Promise.all(entitiesPromises)
    log('extracting done', 'fontColor:green')
    return entitiesArray

}

export function saveAsCSV (entities: IEntity[]): Promise<string> {

    const outputPath = './output/local_document.csv'
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
