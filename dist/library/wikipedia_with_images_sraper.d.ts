interface IScrapOptions {
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
interface IEntity {
    [key: string]: string;
}
export declare function getPage(scrapRequestOptions?: IScrapOptions): Promise<IScrapResponse>;
export declare function scrapContent(data: string): Promise<IEntity[]>;
export declare function fetchImage(url: string, filename: string, extension: string, delayTime?: number): Promise<void>;
export declare function saveAsCSV(entities: IEntity[]): Promise<string>;
export {};
