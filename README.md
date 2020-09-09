# universal-nodejs-harvester

## description

The goal of this project is to create universal nodejs harvester, that has a visual interface that lets a user select portions of website and then assign those portions to columns of an excell file or a database. Then the harvester would on a regular basis visit the website, scrap by the rules that got defined and save the data somewhere. This way without programming anyone could scrap content from any source to use it for what ever needs they have.

But for now only a part of this vision has been coded, which is the harvester itself. This tool visits a webpage, grabs the entire html code, parses it based on hardcoded rules (that you can adapt manually to your own needs, see the next section "examples" for an explanation) and then saves the extracted data into a csv file.

## examples

To check out the examples open the index.ts file located in src

The first example of this project is a web scraper / content harvester that reads the content of the [hacker news homepage](https://news.ycombinator.com/) and saves the result into a csv file, you can modify that code to start crawling any other website. All you need to do is set the correct URL and then you also need to adapt the dom selectors to extract the data you need from the scrapped html document. After extracting the information you seek, you finally need to adapt the columns of the csv output file to match your content or even replace the csv file with any database storage you prefer.

The second example does a similar job, except that instead of crwaling a webpage on the web it loads a static html file from a local folder on your computer, the next two steps are similar to what is done in the first example.

The third example is a [wikipedia.org list of countries by population (united nations data source)](https://en.wikipedia.org/wiki/List_of_countries_by_population_(United_Nations)) scrapper which harvests the html document content but will also download each of the country flags  images. The script will create a csv file with the names of all the countries in the world and will also download each flag image from wikipedia, it downloads the images at an interval of 1 to 5 seconds. The csv file can be easily converted to a google sheet which will then dispay the flags images using a cell formula, for each country row.

## install

To install the (npm) dependencies:  

```shell
npm i
```

## lint

To lint:  

```shell
npm run lint
```

## build

To do a build (compile typescript):  

```shell
npm run build
```

## start

To start the harvester type:  

```shell
npm run start
```

## TODOs

check out the [TODO.md](documentation/TODO.md) file

## controversy

I'm aware tools like this one are always surrounded by some sort of controversy. Yes there are a lot of dubious usage cases for such a tool, but there are also lots of valid and legal reasons to want such a tool, for example I created this tool for my personal needs, without bad intentions and not to do something illegal. I wanted to scrap information from my personal account on a social platform (that did not have an API at that time) and display the result on my own blog. This allowed me to update my data in one place and have it automatically displayed in several other places without me having to post the content manually multiple times.
