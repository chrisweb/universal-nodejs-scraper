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
interface IArticle extends IArticlePartTitle, IArticlePartScore {
}
export declare function getPage(scrapRequestOptions?: IScrapOptions): Promise<IScrapResponse>;
export declare function scrapContent(page: string): Promise<IArticle[]>;
export declare function saveAsCSV(articles: IArticle[]): Promise<string>;
export {};
