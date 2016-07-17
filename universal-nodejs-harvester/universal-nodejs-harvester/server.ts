// nodejs request module
let request = require('request');

// nodejs request module
let fs = require('fs');

// https://github.com/cheeriojs/cheerio
let cheerio = require('cheerio');

// https://github.com/zemirco/json2csv
let json2csv = require('json2csv');

let urlToScrap = 'http://www.gamescom-cologne.com/gamescom/exhibitor-search/index.php';
let detailsUrlDomain = 'http://www.gamescom-cologne.com';

let scrap = function () {

    request(urlToScrap, function (error, response, html) {

        if (!error && response.statusCode == 200) {

            let $ = cheerio.load(html);

            let parsedResults = [];

            let $body = $('body');

            let $elementWithId = $body.find('#ausform');
            let $table = $('#ausform').find('table');
            let $tableBody = $table.find('tbody');
            let $allRows = $tableBody.children('tr');

            $allRows.each(function (index, element) {

                let $element = $(element);

                let $titleColumn = $element.find('.cspacer.ca3');
                let $countryColumn = $element.find('.cspacer.ca4');
                let $hallsColumn = $element.find('.cspacer.ca5');
                let $boothsColumn = $element.find('.cspacer.ca6');

                let $titleColumnLink = $titleColumn.find('a');
                let detailsUrl = detailsUrlDomain + $titleColumnLink.prop('href');
                let name = $titleColumnLink.text().trim();

                let country = $countryColumn.text().trim();

                let halls = $hallsColumn.text().trim().replace(/<br>/g, ' ');

                let booths = $boothsColumn.text().trim().replace(/<br>/g, ' ');

                // metadata
                var metadata = {
                    //detailsUrl: detailsUrl,
                    name: name,
                    country: country,
                    halls: halls,
                    booths: booths
                };

                parsedResults.push(metadata);

            });


            console.log(parsedResults);

            saveAsCSV(parsedResults);

        }



    });

};

let saveAsCSV = function (json) {

    

    /*var json = [
        {
            "url": "Audi",
            "title": 40000
        }
    ];*/

    //let fields = ['name', 'country', 'halls', 'booths', 'website', 'email'];
    let fields = ['name', 'country', 'halls', 'booths'];

    json2csv({ data: json, fields: fields }, function (error, csv) {

        if (error) {

            console.log(error);

        } else {

            fs.writeFile('output.csv', csv, function (err) {

                if (error) {

                    console.log(error);

                } else {

                    console.log('file saved');

                }

            });

        }

    });

};

scrap();