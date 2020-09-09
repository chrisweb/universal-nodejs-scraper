# universal-nodejs-harvester

## description

The goal of this project is to create universal nodejs harvester, that has a visual interface that lets a user select portions of website and then assign those portions to columns of an excell file or a database. Then the harvester would on a regular basis visit the website, scrap by the rules that got defined and save the data somewhere. This way without programming anyone could scrap content from any source to use it for what ever needs they have.

But for now only a part of this vision has been coded, which is the harvester itself. This tool visits a webpage, grabs the entire html code, parses it based on hardcoded rules (that you can adapt manually to your own needs, see the next section "examples" for an explanation) and then saves the extracted data into a csv file.

## examples

To check out the examples open the index.ts file located in src

The first example of this project is a web scraper / content harvester that reads the content of the [hacker news homepage](https://news.ycombinator.com/) and saves the result into a csv file, you can modify that code to fetch any other website and then you need to adapt the selectors to match the scrapped content and be able to extract the information you seek, then finally you need to adapt the columns of the csv output to match your content.

The second example does a similar job, except that instead of fetching a webpage on the web it loads a static html file from a folder, the next two steps are similar to what is done in the first example.

The third example is a [wikipedia.org list of countries by population (united nations data source)](https://en.wikipedia.org/wiki/List_of_countries_by_population_(United_Nations)) scrapper which also scraps images. The script will create a csv file with the names of all the countries in the world and will also download each flag image from wikipedia, it downloads the images at an interval of 1 to 5 seconds. The csv file can be easily converted to a google sheet which will then dispay the flags images using a cell formula, for each country row.

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
