export interface IGBFNews {
    url: string;
    text: string;
    thumbnailImg: string;
    date: string;
}
export interface IGBFSSRList {
    url: string;
    text: string;
    thumbnailImg: string;
}
export interface IGBFSSRByClassList {
    thumbnailImg: string;
    name: string;
    url: string;
    charaType: string;
    race: string;
    weapon: [string, string];
    hp: string;
    attack: string;
}
