import observable = require("data/observable");

// -----------------------------------------------------------
//  TEAM MODEL
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

interface Name {
    first: string,
    last: string
}

interface Person {
    _id: string,
    email: string,
    name: Name,
    phone: string,
    photo: Image
}

export interface Content {
    brief: string;
    extended: string;
}

export interface Team {
    _id: string;
    content: Content;
    image: Image;
    klasse: string,
    leiders: Array<Person>
    name: string,
    order: number,
    spelers: string,
    sponsors: string,
    tag: string,    
    trainers: Array<Person>
}

export class TeamModel extends observable.Observable implements Team {
    constructor(source?: Team) {
        super();

        console.log("in constructor teams model");

        if (source) {
            this.__id = source._id;
            this._content = source.content;
            this._image = source.image;
            this._klasse = source.klasse;
            this._leiders = source.leiders;
            this._name = source.name;
            this._order = source.order;
            this._spelers = source.spelers;
            this._sponsors = source.sponsors;
            this._tag = source.tag;
            this._trainers = source.trainers;
        }
    }

    private __id: string;
    private _content: Content;
    private _image: Image;
    private _klasse: string;
    private _leiders: Array<Person>;
    private _name: string;
    private _order: number;
    private _spelers: string;
    private _sponsors: string;
    private _tag: string;    
    private _trainers: Array<Person>;

    get _id(): string {
        return this.__id;
    }

    get content(): Content {
        return this._content;
    }

    get image(): Image {
        return this._image;
    }

    get klasse(): string {
        return this._klasse;
    }

    get leiders(): Array<Person> {
        return this._leiders;
    }

    get name(): string {
        return this._name;
    }

    get order(): number {
        return this._order;
    }

    get spelers(): string {
        return this._spelers;
    }

    get sponsors(): string {
        return this._sponsors;
    }

    get tag(): string {
        return this._tag;
    }

    get trainers(): Array<Person> {
        return this._trainers;
    }

}