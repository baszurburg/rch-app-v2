﻿import observable = require("data/observable");
import dialogs = require("ui/dialogs");
import view = require("ui/core/view");
import localSettings = require("application-settings");
import platform = require("platform");
import appModule = require("application");
import types = require("utils/types");
import postModel = require("../models/posts/posts");
import agendaModel = require("../models/agenda/agenda");
import firebase = require("nativescript-plugin-firebase");

//var LOADING_ERROR = "Could not load latest news. Check your Internet connection and try again.";


////////////////////////////
// MODELS
////////////////////////////
interface NewsCategory {
    Id: string;
    title: string;
}

var newsCategories: Array<NewsCategory> = [
    { title: "Algemeen nieuws", Id: '56d61c723d4aaadc196caa4f' },
    { title: "Jeugd nieuws", Id: '56d61c893d4aaadc196caa50' },
    { title: "Verslagen", Id: '56d61c943d4aaadc196caa51' }
];

var posts: Array<postModel.PostModel> = new Array<postModel.PostModel>();
var agendaItems: Array<agendaModel.AgendaModel> = new Array<agendaModel.AgendaModel>();

//////////////////////////////////////////////////////
//  APP VIEWMODEL
//////////////////////////////////////////////////////

export class AppViewModel extends observable.Observable {
    private _selectedNewsIndex;
    private _posts: Array<postModel.PostModel>;
    private _agendaItems: Array<agendaModel.AgendaModel>;

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

    get posts(): Array<postModel.PostModel> {
        return this._posts;
    }
    get agendaItems(): Array<agendaModel.AgendaModel> {
        return this._agendaItems;
    }

    get selectedNewsIndex(): number {
        return this._selectedNewsIndex;
    }

    // SELECT NEWS CATEGORY
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

    // SELECT VIEW IN SIDEDRAWER
    public selectView(index: number, titleText: string) {
        this.selectedViewIndex = index;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedViewIndex", value: this.selectedViewIndex });
        this.set("actionBarTitle", titleText);
        this.set("isNewsPage", this.selectedViewIndex === 10);
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
        this._agendaItems = agendaItems;
        
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "agendaItems", value: this._agendaItems });
    }

}

export var appModel = new AppViewModel();

function pushPosts(postsFromFirebase: Array<postModel.Post>) {
    // console.log('postsFromFirebase.length: ' + postsFromFirebase.length);

    // Sort the posts by date descending
    postsFromFirebase.sort(function(a, b) {
        return (Date.parse(b.publishedDate.toString().substr(0, 10))) - (Date.parse(a.publishedDate.toString().substr(0, 10)));
    });

    posts = [];

    for (var i = 0; i < postsFromFirebase.length; i++) {
        var newPost = new postModel.PostModel(postsFromFirebase[i]);
        posts.push(newPost);
        
    }
}

function pushAgendaItems(itemsFromFirebase: Array<agendaModel.Agenda>) {

    // No need to sort the items
    agendaItems = [];

    for (var i = 0; i < itemsFromFirebase.length; i++) {
        var newAgendaItem = new agendaModel.AgendaModel(itemsFromFirebase[i]);
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
                    pushPosts(<Array<postModel.Post>>result.value);
                    break;
                    case "agenda":
                    pushAgendaItems(<Array<agendaModel.Agenda>>result.value);
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

export var firebaseViewModel = new FirebaseModel();

firebaseViewModel.doQuery('posts', function() {
    appModel.onNewsDataLoaded();
});
firebaseViewModel.doQuery('agenda', function() {
    null;
});