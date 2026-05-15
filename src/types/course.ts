export interface CourseResponse {
    data: Datum[];
    meta: Meta;
}

export interface Datum {
    id:      number;
    title:   string;
    detail:  string;
    date:    string;
    view:    number;
    picture: string;
}

export interface Meta {
    status:      string;
    status_code: number;
}
