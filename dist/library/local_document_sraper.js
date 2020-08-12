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
const scrapOptions = {
    saveAs: 'csv',
    documentName: 'example.html'
};
export function getDocument(scrapRequestOptions = scrapOptions) {
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
export function scrapContent(data) {
    log('finished harvesting, now extracting data ...', 'fontColor:yellow');
    const $ = cheerioLoad(data);
    const $body = $('body');
    const $mainTable = $body.find('table');
    const $tableRows = $mainTable.children('tr');
    const entitiesPromises = [];
    $tableRows.each(function (index, element) {
        const entitiesPromise = new Promise((resolve, reject) => {
            const $row = $(element);
            try {
                const first = parseInt($row.find('.left').text());
                const second = parseInt($row.find('.middle').text());
                const third = parseInt($row.find('.right').text());
                resolve({ first: first, second: second, third: third });
            }
            catch (error) {
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
export function saveAsCSV(entities) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxfZG9jdW1lbnRfc3JhcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYnJhcnkvbG9jYWxfZG9jdW1lbnRfc3JhcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdCQUF3QjtBQUN4QixPQUFPLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sSUFBSSxDQUFDO0FBRWpELHFCQUFxQjtBQUNyQixPQUFPLEtBQUssSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUU3Qix1Q0FBdUM7QUFDdkMsT0FBTyxFQUFFLElBQUksSUFBSSxXQUFXLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFOUMsc0NBQXNDO0FBQ3RDLE9BQU8sRUFBRSxXQUFXLElBQUksbUJBQW1CLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFOUQsb0RBQW9EO0FBQ3BELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQWF6QyxNQUFNLFlBQVksR0FBa0I7SUFDaEMsTUFBTSxFQUFFLEtBQUs7SUFDYixZQUFZLEVBQUUsY0FBYztDQUMvQixDQUFDO0FBRUYsTUFBTSxVQUFVLFdBQVcsQ0FBQyxzQkFBcUMsWUFBWTtJQUV6RSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBRW5DLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRWpELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVyRixRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLFVBQVUsS0FBSyxFQUFFLElBQUk7WUFFM0QsSUFBSSxLQUFLLEVBQUU7Z0JBQ1AsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2pCO1lBRUQsT0FBTyxDQUFDLElBQUksQ0FB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