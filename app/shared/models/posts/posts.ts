import observable = require("data/observable");

// -----------------------------------------------------------
//  POST MODEL
// -----------------------------------------------------------

interface Image {
    format: string;
    height: number;
    imageThumb: string;
    public_id: string;
    resource_type: string;
    secure_url: string;
    siganture: string;
    url: string;
    version: number;
    width: number;
}

export interface Content {
    brief: string;
    extended: string;
}

export interface Post {
    _id: string;
    categories: Array<string>;
    content: Content;
    externalLink: string;
    externalName: string;
    image: Image;
    locked: boolean;
    name: string;
    publishedDate: Date;
    state: string;
    tag: string;
}

export class PostModel extends observable.Observable implements Post {
    constructor(source?: Post) {
        super();

        if (source) {
            this.__id = source._id;
            this._categories = source.categories;
            this._content = source.content;
            this._externalLink = source.externalLink;
            this._externalName = source.externalName;
            this._image = source.image;
            this._locked = source.locked;
            this._name = source.name;
            this._publishedDate = source.publishedDate;
            this._state = source.state;
            this._tag = source.tag;
        }
    }

    // ToDo: remove this one
    private fixDate(date: Date): Date {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }

    private __id: string;
    private _categories: Array<string>;
    private _content: Content;
    private _externalLink: string;
    private _externalName: string;
    private _image: Image;
    private _locked: boolean;
    private _name: string;
    private _publishedDate: Date;
    private _state: string;
    private _tag: string;

    get _id(): string {
        return this.__id;
    }

    get categories(): Array<string> {
        return this._categories;
    }

    get content(): Content {
        return this._content;
    }

    get externalLink(): string {
        return this._externalLink;
    }

    get externalName(): string {
        return this._externalName;
    }

    get image(): Image {
        return this._image;
    }

    get locked(): boolean {
        return this._locked;
    }

    get name(): string {
        return this._name;
    }

    get publishedDate(): Date {
        return this._publishedDate;
    }

    get state(): string {
        return this._state;
    }

    get tag(): string {
        return this._tag;
    }

    get dateFormatted(): string {
        var dateZ = new Date(this._publishedDate.toString().substr(0, 10));
        var dayNumber = dateZ.getDay();
        var day = dateZ.getDate();
        var month = dateZ.getMonth();
        var year = dateZ.getFullYear();

        var days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
        var months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

        return days[dayNumber] + ', ' + day + ' ' + months[month] + ' ' + year; 

    }

    // ToDo: fille in the days and month
    get dateFormattedFull(): string {
        var dateZ = new Date(this._publishedDate.toString().substr(0, 10));
        var dayNumber = dateZ.getDay();
        var day = dateZ.getDate();
        var month = dateZ.getMonth();
        var year = dateZ.getFullYear();

        var days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
        var months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

        var today = new Date();
         
        var date1 = new Date(this._publishedDate.toString());
        //var date2 = new Date(today);
        var timeDiff = Math.abs(dateZ.getTime() - today.getTime());
        var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24)); 
        
        if (diffDays === 0) {
            return "Vandaag";
        } else if (diffDays === 1) {
            return "Gisteren";
        }  else if (diffDays === 2) {
            return "Eergisteren";
        } else if (diffDays === 2) {
            return "Eergisteren";
        } else if (diffDays === 3) {
            return "Drie dagen geleden";
        } else if (diffDays === 4) {
            return "Vier dagen geleden";
        } else if (diffDays === 5) {
            return "Vijf dagen geleden";
        } else if (diffDays === 6) {
            return "Zes dagen geleden";
        } else if (diffDays > 6 && diffDays < 14) {
            return "Vorige week";
        } else if (diffDays > 13 && diffDays < 21) {
            return "2 weken geleden";
        } else if (diffDays > 20 && diffDays < 28) {
            return "3 weken geleden";
        } else if (diffDays > 27 && diffDays < 59) {
            return "Vorige maand";
        } else if (diffDays > 58 && diffDays < 90) {
            return "2 maanden geleden";
        } else {
            return day + ' ' + months[month] + ' ' + year; 
        }

    }

}