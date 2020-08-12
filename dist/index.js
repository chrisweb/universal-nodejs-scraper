'use strict';

var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var json2csv = require('json2csv');
var chriswebUtilities = require('chrisweb-utilities');

// nodejs request module
const scrapOptions = {
    saveAs: 'csv',
    documentName: 'example.html'
};
function getDocument(scrapRequestOptions = scrapOptions) {
    return new Promise((resolve, reject) => {
        chriswebUtilities.log('starting scrapping...', 'fontColor:yellow');
        const filePath = path.join(__dirname, '../input/', scrapRequestOptions.documentName);
        fs.readFile(filePath, { encoding: 'utf-8' }, function (error, data) {
            if (error) {
                reject(error);
            }
            resolve(data);
        });
    });
}
function scrapContent(data) {
    chriswebUtilities.log('finished harvesting, now extracting data ...', 'fontColor:yellow');
    const $ = cheerio.load(data);
    const $body = $('body');
    const $mainTable = $body.find('table');
    const $mainTableBody = $mainTable.find('tbody');
    const $tableRows = $mainTableBody.children('tr');
    //console.log($tableRows);
    const entitiesPromises = [];
    $tableRows.each(function (index, element) {
        const entitiesPromise = new Promise((resolve, reject) => {
            const $row = $(element);
            try {
                const first = $row.find('.left').text();
                const second = $row.find('.middle').text();
                const third = $row.find('.right').text();
                resolve({ first: first, second: second, third: third });
            }
            catch (error) {
                reject(error);
            }
        });
        entitiesPromises.push(entitiesPromise);
    });
    return Promise.all(entitiesPromises).then((entitiesArray) => {
        chriswebUtilities.log('extracting done', 'fontColor:green');
        return entitiesArray;
    });
}
function saveAsCSV(entities) {
    const outputPath = './output/example.csv';
    const output = fs.createWriteStream(outputPath, { encoding: 'utf8' });
    // note to self: careful, the following field names need to match the object property names!!!
    const fields = ['first', 'second', 'third'];
    const json2csvOptions = { fields };
    const asyncParser = new json2csv.AsyncParser(json2csvOptions);
    entities.forEach((entity) => {
        asyncParser.input.push(JSON.stringify(entity));
    });
    asyncParser.input.push(null);
    const parsingProcessor = asyncParser.toOutput(output);
    chriswebUtilities.log('writing csv file done (you can find it in the folder called "output")', 'fontColor:green');
    return parsingProcessor.promise();
}

// example 1: grab top hacker news articles, extract the title, rank and score, save data as csv file
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
//# sourceMappingURL=index.js.map
