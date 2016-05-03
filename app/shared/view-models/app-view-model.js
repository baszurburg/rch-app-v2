"use strict";
var observable = require("data/observable");
var dialogModel = require("ui/dialogs");
var settingsModel = require("../services/settings/settings");
var postModel = require("../models/posts/posts");
var agendaModel = require("../models/agenda/agenda");
var firebase = require("nativescript-plugin-firebase");
//var LOADING_ERROR = "Could not load latest news. Check your Internet connection and try again.";
var posts = new Array();
var agendaItems = new Array();
var settings = new settingsModel.SettingsModel();
var newsCategories = [
    { title: "Algemeen nieuws", Id: '56d61c723d4aaadc196caa4f' },
    { title: "Jeugd nieuws", Id: '56d61c893d4aaadc196caa50' },
    { title: "Verslagen", Id: '56d61c943d4aaadc196caa51' }
];
var infoCategories = [
    { title: "Algemene informatie", Id: '0' },
    { title: "Jeugd informatie", Id: '1' },
];
//////////////////////////////////////////////////////
//  APP VIEWMODEL
//////////////////////////////////////////////////////
var AppViewModel = (function (_super) {
    __extends(AppViewModel, _super);
    function AppViewModel() {
        _super.call(this);
        console.log("in constructor app view model");
        this.selectedNewsIndex = 0;
        this.selectedInfoIndex = 0;
        this.selectedViewIndex = 5;
        this.set("actionBarTitle", "Thuis");
        this.set("isNewsLoading", true);
        this.set("isAgendaLoading", true);
        this.set("isNewsPage", false);
        this.set("isInfosPage", false);
        this.user = settings.user;
        this._isAuthenticated = this.isAuthenticated;
    }
    Object.defineProperty(AppViewModel.prototype, "isAuthenticated", {
        get: function () {
            try {
                console.log("typeof(this._user.userId) !== 'undefined' : " + (typeof (this._user.userId) !== 'undefined') + " " + typeof (this._user.userId));
                if (this._isAuthenticated !== (typeof (this._user.userId) !== "undefined")) {
                    this.isAuthenticated = (typeof (this._user.userId) !== "undefined");
                }
                return this._isAuthenticated;
            }
            catch (error) {
                return false;
            }
        },
        set: function (value) {
            if (this._isAuthenticated !== value) {
                this._isAuthenticated = value;
                this.notifyPropertyChange("isAuthenticated", value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppViewModel.prototype, "posts", {
        get: function () {
            return this._posts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppViewModel.prototype, "agendaItems", {
        get: function () {
            return this._agendaItems;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppViewModel.prototype, "user", {
        get: function () {
            this.user = settings.user;
            return this._user;
        },
        // SETTERS
        set: function (value) {
            this._user = value;
            this.notifyPropertyChange("user", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppViewModel.prototype, "selectedNewsIndex", {
        get: function () {
            return this._selectedNewsIndex;
        },
        // SELECT NEWS CATEGORY
        set: function (value) {
            if (this._selectedNewsIndex !== value) {
                this._selectedNewsIndex = value;
                this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedNewsIndex", value: value });
                this.set("newsHeader", newsCategories[value].title);
                if (typeof posts === 'object') {
                    this.filterNews();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppViewModel.prototype, "selectedInfoIndex", {
        get: function () {
            return this._selectedInfoIndex;
        },
        // SELECT INFO CATEGORY
        set: function (value) {
            if (this._selectedInfoIndex !== value) {
                this._selectedInfoIndex = value;
                this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedInfoIndex", value: value });
                this.set("infoHeader", infoCategories[value].title);
            }
        },
        enumerable: true,
        configurable: true
    });
    /*******************************
     * PUBLIC FUNCTIONS
     *******************************/
    // SELECT VIEW IN SIDEDRAWER
    AppViewModel.prototype.selectView = function (index, titleText) {
        this.selectedViewIndex = index;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedViewIndex", value: this.selectedViewIndex });
        this.set("actionBarTitle", titleText);
        this.set("isNewsPage", this.selectedViewIndex === 10);
        this.set("isInfoPage", this.selectedViewIndex === 50);
    };
    AppViewModel.prototype.filterNews = function () {
        var _this = this;
        this._posts = posts.filter(function (s) {
            if (typeof s.categories !== 'undefined') {
                return s.categories[0] === newsCategories[_this.selectedNewsIndex].Id;
            }
        });
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "posts", value: this._posts });
    };
    //  ON DATA LOADED
    AppViewModel.prototype.onNewsDataLoaded = function () {
        this.set("isNewsLoading", false);
        this.filterNews();
    };
    AppViewModel.prototype.onAgendaDataLoaded = function () {
        this.set("isAgendaLoading", false);
        this._agendaItems = agendaItems;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "agendaItems", value: this._agendaItems });
    };
    return AppViewModel;
}(observable.Observable));
exports.AppViewModel = AppViewModel;
exports.appModel = new AppViewModel();
function pushPosts(postsFromFirebase) {
    // console.log('postsFromFirebase.length: ' + postsFromFirebase.length);
    // Sort the posts by date descending
    postsFromFirebase.sort(function (a, b) {
        return (Date.parse(b.publishedDate.toString().substr(0, 10))) - (Date.parse(a.publishedDate.toString().substr(0, 10)));
    });
    posts = [];
    for (var i = 0; i < postsFromFirebase.length; i++) {
        var newPost = new postModel.PostModel(postsFromFirebase[i]);
        posts.push(newPost);
    }
}
function pushAgendaItems(itemsFromFirebase) {
    // No need to sort the items
    agendaItems = [];
    for (var i = 0; i < itemsFromFirebase.length; i++) {
        var newAgendaItem = new agendaModel.AgendaModel(itemsFromFirebase[i]);
        agendaItems.push(newAgendaItem);
    }
    exports.appModel.onAgendaDataLoaded();
}
// -----------------------------------------------------------
//  FIREBASE MODEL
// -----------------------------------------------------------
var FirebaseModel = (function () {
    function FirebaseModel() {
        // LOGIN & USER AUTHENTICATION
        this.doLoginAnonymously = function () {
            firebase.login({
                type: firebase.LoginType.ANONYMOUS
            }).then(function (result) {
                dialogModel.alert({
                    title: "Login OK",
                    message: JSON.stringify(result),
                    okButtonText: "Nice!"
                });
            }, function (errorMessage) {
                dialogModel.alert({
                    title: "Login error",
                    message: errorMessage,
                    okButtonText: "OK, pity"
                });
            });
        };
    }
    FirebaseModel.prototype.doQuery = function (typeQuery, callback) {
        var path = "posts", orderByRule = {
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
        var onValueEvent = function (result) {
            // note that the query returns 1 match at a time,
            // in the order specified in the query
            //console.log("Query result: " + JSON.stringify(result));
            if (result.error) {
                dialogModel.alert({
                    title: "Fout downloaden gegevens " + typeQuery,
                    message: result.error,
                    okButtonText: "OK"
                });
            }
            else {
                switch (typeQuery) {
                    case "posts":
                        pushPosts(result.value);
                        break;
                    case "agenda":
                        pushAgendaItems(result.value);
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
        firebase.query(onValueEvent, path, {
            singleEvent: true,
            orderBy: orderByRule
        }).then(function () {
            // console.log("firebase.doQueryPosts done; added a listener");
        }, function (errorMessage) {
            dialogModel.alert({
                title: "Fout lezen gegevens " + typeQuery,
                message: errorMessage,
                okButtonText: "OK"
            });
        });
    };
    ;
    return FirebaseModel;
}());
exports.FirebaseModel = FirebaseModel;
exports.firebaseViewModel = new FirebaseModel();
exports.firebaseViewModel.doQuery('posts', function () {
    exports.appModel.onNewsDataLoaded();
});
exports.firebaseViewModel.doQuery('agenda', function () {
    null;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXZpZXctbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHAtdmlldy1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxJQUFPLFdBQVcsV0FBVyxZQUFZLENBQUMsQ0FBQztBQU0zQyxJQUFPLGFBQWEsV0FBVywrQkFBK0IsQ0FBQyxDQUFDO0FBRWhFLElBQU8sU0FBUyxXQUFXLHVCQUF1QixDQUFDLENBQUM7QUFDcEQsSUFBTyxXQUFXLFdBQVcseUJBQXlCLENBQUMsQ0FBQztBQUN4RCxJQUFPLFFBQVEsV0FBVyw4QkFBOEIsQ0FBQyxDQUFDO0FBRTFELGtHQUFrRztBQUVsRyxJQUFJLEtBQUssR0FBK0IsSUFBSSxLQUFLLEVBQXVCLENBQUM7QUFDekUsSUFBSSxXQUFXLEdBQW1DLElBQUksS0FBSyxFQUEyQixDQUFDO0FBQ3ZGLElBQUksUUFBUSxHQUFHLElBQUksYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBZ0JqRCxJQUFJLGNBQWMsR0FBd0I7SUFDdEMsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxFQUFFLDBCQUEwQixFQUFFO0lBQzVELEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsMEJBQTBCLEVBQUU7SUFDekQsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSwwQkFBMEIsRUFBRTtDQUN6RCxDQUFDO0FBRUYsSUFBSSxjQUFjLEdBQXdCO0lBQ3RDLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUU7SUFDekMsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRTtDQUN6QyxDQUFDO0FBR0Ysc0RBQXNEO0FBQ3RELGlCQUFpQjtBQUNqQixzREFBc0Q7QUFFdEQ7SUFBa0MsZ0NBQXFCO0lBVW5EO1FBQ0ksaUJBQU8sQ0FBQztR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