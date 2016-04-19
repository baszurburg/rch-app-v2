import observable = require("data/observable");
import dialogs = require("ui/dialogs");
import view = require("ui/core/view");
import localSettings = require("application-settings");
import platform = require("platform");
import appModule = require("application");
import types = require("utils/types");
import postModel = require("../models/posts/posts");
import firebase = require("nativescript-plugin-firebase");

var LOADING_ERROR = "Could not load latest news. Check your Internet connection and try again.";

interface NewsCategory {
    Id: string;
    title: string;
}

var newsCategories: Array<NewsCategory> = [
    { title: "Algemeen nieuws", Id: '56d61c723d4aaadc196caa4f' },
    { title: "Jeugd nieuws", Id: '56d61c893d4aaadc196caa50' },
    { title: "Verslagen", Id: '56d61c943d4aaadc196caa51' }
];

//////////////////////////////////////////////////////
//  APP VIEWMODEL
//////////////////////////////////////////////////////

export class AppViewModel extends observable.Observable {
    private _selectedNewsIndex;
    private _posts: Array<postModel.PostModel>;
    private _agendaItems: Array<AgendaModel>;

    public selectedViewIndex: number;

    constructor() {
        super();

        this.selectedNewsIndex = 0;
        this.selectedViewIndex = 5;
        this.set("actionBarTitle", "Thuis");
        this.set("isNewsLoading", true);
        this.set("isAgendaLoading", true);
        this.set("isNewsPage", false);

    }

    // SELECT VIEW IN SIDEDRAWER
    public selectView(index: number, titleText: string) {
        this.selectedViewIndex = index;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedViewIndex", value: this.selectedViewIndex });
        this.set("actionBarTitle", titleText);
        this.set("isNewsPage", this.selectedViewIndex === 10);
    }

    get posts(): Array<PostModel> {
        return this._posts;
    }
    get agendaItems(): Array<AgendaModel> {
        return this._agendaItems;
    }

    // NEWS CATEGORY
    get selectedNewsIndex(): number {
        return this._selectedNewsIndex;
    }

    set selectedNewsIndex(value: number) {
        if (this._selectedNewsIndex !== value) {
            this._selectedNewsIndex = value;
            this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedNewsIndex", value: value });

            this.set("newsHeader", newsCategories[value].title);

            if (typeof posts === 'object') {
                this.filterNews();
            }
        }
    }

    private filterNews() {
        this._posts = posts.filter(s => {
            if (typeof s.categories !== 'undefined') {
                return s.categories[0] === newsCategories[this.selectedNewsIndex].Id;
            }
        });

        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "posts", value: this._posts });
    }

    //  ON DATA LOADED
    public onNewsDataLoaded() {
        this.set("isNewsLoading", false);
        this.filterNews();
    }

    public onAgendaDataLoaded() {
        this.set("isAgendaLoading", false);
        console.log("onAgendaDataLoaded");
        this._agendaItems = agendaItems;
        
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "agendaItems", value: this._agendaItems });
    }

}

export var appModel = new AppViewModel();

function pushPosts(postsFromFirebase: Array<Post>) {
    // console.log('postsFromFirebase.length: ' + postsFromFirebase.length);

    // Sort the posts by date descending
    postsFromFirebase.sort(function(a, b) {
        return (Date.parse(b.publishedDate.toString().substr(0, 10))) - (Date.parse(a.publishedDate.toString().substr(0, 10)));
    });

    for (var i = 0; i < postsFromFirebase.length; i++) {
        var newPost = new postModel.PostModel(postsFromFirebase[i]);
        posts.push(newPost);
        
    }
}

function pushAgendaItems(itemsFromFirebase: Array<Agenda>) {
    // console.log('postsFromFirebase.length: ' + postsFromFirebase.length);

    // No need to sort the items

    for (var i = 0; i < itemsFromFirebase.length; i++) {
        var newAgendaItem = new AgendaModel(itemsFromFirebase[i]);
        agendaItems.push(newAgendaItem);
    }

    appModel.onAgendaDataLoaded();
}


// -----------------------------------------------------------
//  FIREBASE MODEL
// -----------------------------------------------------------

export class FirebaseModel {

    // LOGIN & USER AUTHENTICATION

    public doLoginAnonymously = function() {
        firebase.login({
            type: firebase.LoginType.ANONYMOUS
        }).then(
            function(result) {
                dialogs.alert({
                    title: "Login OK",
                    message: JSON.stringify(result),
                    okButtonText: "Nice!"
                });
            },
            function(errorMessage) {
                dialogs.alert({
                    title: "Login error",
                    message: errorMessage,
                    okButtonText: "OK, pity"
                });
            }
            );
    };

    // FROM HERE ARE THE RCH FUNCTIONS
    // public doQueryPosts(callback) {
    //     var path = "/posts";
    //     var onValueEvent = function(result) {
    //         // note that the query returns 1 match at a time,
    //         // in the order specified in the query
    //         //console.log("Query result: " + JSON.stringify(result));

    //         if (result.error) {
    //             dialogs.alert({
    //                 title: "Listener error",
    //                 message: result.error,
    //                 okButtonText: "Darn!!"
    //             });
    //         } else {
    //             pushPosts(<Array<Post>>result.value);
    //             callback();
    //         }
    //     };

    //     firebase.query(
    //         onValueEvent,
    //         path,
    //         {
    //             singleEvent: true,
    //             orderBy: {
    //                 type: firebase.QueryOrderByType.CHILD,
    //                 value: 'publishedDate'
    //             }
    //         }
    //     ).then(
    //         function() {
    //             // console.log("firebase.doQueryPosts done; added a listener");
    //         },
    //         function(errorMessage) {
    //             dialogs.alert({
    //                 title: "Fout lezen gegevens",
    //                 message: errorMessage,
    //                 okButtonText: "OK"
    //             });
    //         });
    // };

    // public doQueryAgenda(callback) {
    //     var path = "/agenda";
        
    //     var onValueEvent = function(result) {
    //         // note that the query returns 1 match at a time,
    //         // in the order specified in the query
    //         //console.log("Query result: " + JSON.stringify(result));

    //         if (result.error) {
    //             dialogs.alert({
    //                 title: "Listener error",
    //                 message: result.error,
    //                 okButtonText: "Darn!!"
    //             });
    //         } else {
    //             pushAgendaItems(<Array<Agenda>>result.value);
    //             callback();
    //         }
    //     };

    //     firebase.query(
    //         onValueEvent,
    //         path,
    //         {
    //             singleEvent: true,
    //             orderBy: {
    //                 type: firebase.QueryOrderByType.KEY
    //             }
    //         }
    //     ).then(
    //         function() {
    //             // console.log("firebase.doQueryPosts done; added a listener");
    //         },
    //         function(errorMessage) {
    //             dialogs.alert({
    //                 title: "Fout lezen gegevens",
    //                 message: errorMessage,
    //                 okButtonText: "OK"
    //             });
    //         });
    // };

//

    public doQuery(typeQuery, callback) {
    
        var path = "posts",
            orderByRule = {
                    type: firebase.QueryOrderByType.KEY,
                    value: null
                };
        
            
        switch (typeQuery) {
            case "posts":
            path = "/posts";
            orderByRule.type = firebase.QueryOrderByType.CHILD;
            orderByRule.value = 'publishedDate';
                
            break;
            case "agenda":
            path = "/agenda";
            break;
            case "programma-thuis":
            path = "/programmaT";
            break;
            case "programma-uit":
            path = "/programmaU";
            break;
            case "uitslagen-thuis":
            path = "/uitslagenT";
            break;
            case "uitslagen-uit":
            path = "/uitslagenU";
            break;
            default:
            path = "/posts";
        }
        
        var onValueEvent = function(result) {
            // note that the query returns 1 match at a time,
            // in the order specified in the query
            //console.log("Query result: " + JSON.stringify(result));

            if (result.error) {
                dialogs.alert({
                    title: "Fout downloaden gegevens " + typeQuery,
                    message: result.error,
                    okButtonText: "OK"
                });
            } else {
                
                switch (typeQuery) {
                    case "posts":
                    pushPosts(<Array<Post>>result.value);
                    break;
                    case "agenda":
                    pushAgendaItems(<Array<Agenda>>result.value);
                    break;
                    case "programma-thuis":
                    //path = "/programmaT";
                    break;
                    case "programma-uit":
                    //path = "/programmaU";
                    break;
                    case "uitslagen-thuis":
                    //path = "/uitslagenT";
                    break;
                    case "uitslagen-uit":
                    //path = "/uitslagenU";
                    break;
                    default:
                    null;
                }
                
                callback();
            }
        };

        firebase.query(
            onValueEvent,
            path,
            {
                singleEvent: true,
                orderBy: orderByRule
            }
        ).then(
            function() {
                // console.log("firebase.doQueryPosts done; added a listener");
            },
            function(errorMessage) {
                dialogs.alert({
                    title: "Fout lezen gegevens " + typeQuery,
                    message: errorMessage,
                    okButtonText: "OK"
                });
            });
    };


}


////////////////////////////
// MODELS
////////////////////////////


var posts: Array<postModel.PostModel> = new Array<postModel.PostModel>();

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

var agendaItems: Array<AgendaModel> = new Array<AgendaModel>();

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


////////////////////////////////////////////////
// END MODELS
////////////////////////////////////////////////


export var firebaseViewModel = new FirebaseModel();

firebaseViewModel.doQuery('posts', function() {
    appModel.onNewsDataLoaded();
});
firebaseViewModel.doQuery('agenda', function() {
    null;
});