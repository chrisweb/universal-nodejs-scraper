// nodejs request module
import { readFile, createWriteStream } from 'fs';

// nodejs path module
import * as path from 'path';

// https://github.com/cheeriojs/cheerio
import { load as cheerioLoad } from 'cheerio';

// https://github.com/zemirco/json2csv
import { AsyncParser as json2csvAsyncParser } from 'json2csv';

// https://github.com/chrisweb/chrisweb-utilities.js
import { log } from 'chrisweb-utilities';

interface IScrapOptions {
    saveAs: string;
    documentName: string;
}

interface IEntity {
    first: number;
    second: number;
    third: number;
}

const scrapOptions: IScrapOptions = {
    saveAs: 'csv',
    documentName: 'example.html'
};

export function getDocument(scrapRequestOptions: IScrapOptions = scrapOptions): Promise<string> {

    return new Promise((resolve, reject) => {

        log('starting scrapping...', 'fontColor:yellow');

        const filePath = path.join(__dirname, '../input/', scrapRequestOptions.documentName);

        readFile(filePath, { encoding: 'utf-8' }, function (error, data) {

            if (error) {
                reject(error);
            }

            resolve(data);

        });

    });

}

export function scrapContent(data: string): Promise<IEntity[]> {

    log('finished harvesting, now extracting data ...', 'fontColor:yellow');

    const $ = cheerioLoad(data);

    const $body = $('body');
    const $mainTable = $body.find('table');
    const $tableRows = $mainTable.children('tr');

    const entitiesPromises: Promise<IEntity>[] = [];

    $tableRows.each(function (index, element) {

        const entitiesPromise: Promise<IEntity> = new Promise((resolve, reject) => {

            const $row = $(element);

            try {

                const first = parseInt($row.find('.left').text());
                const second = parseInt($row.find('.right').text());
                const third = parseInt($row.find('.middle').text());

                resolve({ first: first, second: second, third: third });

            } catch (error) {
                reject(error);
            }

        });

        entitiesPromises.push(entitiesPromise);

    });

    return Promise.all(entitiesPromises).then((entitiesArray) => {

        log('extracting done', 'fontColor:green');

        return entitiesArray;

    });

}

export function saveAsCSV(entities: IEntity[]): Promise<string> {

    const outputPath = './output/example.csv';
    const output = createWriteStream(outputPath, { encoding: 'utf8' });
    const fields = ['a', 'b', 'c'];
    const json2csvOptions = { fields };
    const asyncParser = new json2csvAsyncParser(json2csvOptions);

    entities.forEach((entity) => {
        asyncParser.input.push(JSON.stringify(entity));
    });

    asyncParser.input.push(null);

    const parsingProcessor = asyncParser.toOutput(output);

    log('writing csv file done (you can find it in the folder called "csv")', 'fontColor:green');

    return parsingProcessor.promise();

}