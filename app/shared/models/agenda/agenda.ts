import observable = require("data/observable");

// -----------------------------------------------------------
//  AGENDA MODEL
// -----------------------------------------------------------

interface Location {
    latitude: string;
    location: string;
    longitude: string;
}

export interface Agenda {
    id: string;
    allDay: boolean;
    color: string;
    description: string;
    editable: boolean;
    end: Date;
    location: Location;
    start: Date;
    title: string;
    url: string;
}

export class AgendaModel extends observable.Observable implements Agenda {
    constructor(source?: Agenda) {
        super();

        if (source) {
            this._id = source.id;
            this._allDay = source.allDay;
            this._color = source.color;
            this._description = source.description;
            this._editable = source.editable;
            this._end = source.end;
            this._location = source.location;
            this._start = source.start;
            this._title = source.title;
            this._url = source.url;
        }
    }

    private _id: string;
    private _allDay: boolean;
    private _color: string;
    private _description: string;
    private _editable: boolean;
    private _end: Date;
    private _location: Location;
    private _start: Date;
    private _title: string;
    private _url: string;

    get id(): string {
        return this._id;
    }

    get allDay(): boolean {
        return this._allDay;
    }

    get color(): string {
        return this._color;
    }

    get description(): string {
        return this._description;
    }

    get editable(): boolean {
        return this._editable;
    }

    get end(): Date {
        return this._end;
    }

    get location(): Location {
        return this._location;
    }

    get start(): Date {
        return this._start;
    }

    get title(): string {
        return this._title;
    }

    get url(): string {
        return this._url;
    }

    get eventDateTime(): string {

        var days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
        var months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

        var startDate = new Date(this._start.toString().substr(0, 16)),
            startDateDayTemp = startDate.toString().substr(0,10),
            startDayNumber = startDate.getDay(),
            startDay = startDate.getDate(),
            startMonth = startDate.getMonth(),
            startYear = startDate.getFullYear(),
            startHours = startDate.getHours(),
            startMinutes = startDate.getMinutes().toString();

        var endDate = new Date(this._end.toString().substr(0, 16)),
            endDateDayTemp = endDate.toString().substr(0,10),
            endDayNumber = endDate.getDay(),
            endDay = endDate.getDate(),
            endMonth = endDate.getMonth(),
            endYear = endDate.getFullYear(),
            endHours = endDate.getHours(),
            endMinutes = endDate.getMinutes().toString();

        if (!startHours && !endHours) {
            if (startDateDayTemp === endDateDayTemp) {
                return days[startDayNumber] + ', ' + startDay + ' ' + months[startMonth] + ' ' + startYear;
            } else {
                return days[startDayNumber] + ', ' + startDay + ' ' + months[startMonth] + ' ' + startYear + ' - ' +
                        days[endDayNumber] + ', ' + endDay + ' ' + months[endMonth] + ' ' + endYear;
            }
        } else {
            if (startDateDayTemp === endDateDayTemp) {
                return days[startDayNumber] + ', ' + startDay + ' ' + months[startMonth] + ' ' + startYear + ' ' + startHours + ':' + startMinutes + ' - ' + endHours + ':' + endMinutes;
            } else {
                return days[startDayNumber] + ', ' + startDay + ' ' + months[startMonth] + ' ' + startYear + startHours + ':' + startMinutes + ' - ' + 
                days[endDayNumber] + ', ' + endDay + ' ' + months[endMonth] + ' ' + endYear + ' ' + endHours + ':' + endMinutes;   
            }
        }

    }
}