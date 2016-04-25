"use strict";
var observable = require("data/observable");
var dialogs = require("ui/dialogs");
var postModel = require("../models/posts/posts");
var agendaModel = require("../models/agenda/agenda");
var firebase = require("nativescript-plugin-firebase");
var newsCategories = [
    { title: "Algemeen nieuws", Id: '56d61c723d4aaadc196caa4f' },
    { title: "Jeugd nieuws", Id: '56d61c893d4aaadc196caa50' },
    { title: "Verslagen", Id: '56d61c943d4aaadc196caa51' }
];
var posts = new Array();
var agendaItems = new Array();
//////////////////////////////////////////////////////
//  APP VIEWMODEL
//////////////////////////////////////////////////////
var AppViewModel = (function (_super) {
    __extends(AppViewModel, _super);
    function AppViewModel() {
        _super.call(this);
        this.selectedNewsIndex = 0;
        this.selectedViewIndex = 5;
        this.set("actionBarTitle", "Thuis");
        this.set("isNewsLoading", true);
        this.set("isAgendaLoading", true);
        this.set("isNewsPage", false);
    }
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
    // SELECT VIEW IN SIDEDRAWER
    AppViewModel.prototype.selectView = function (index, titleText) {
        this.selectedViewIndex = index;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedViewIndex", value: this.selectedViewIndex });
        this.set("actionBarTitle", titleText);
        this.set("isNewsPage", this.selectedViewIndex === 10);
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
                dialogs.alert({
                    title: "Login OK",
                    message: JSON.stringify(result),
                    okButtonText: "Nice!"
                });
            }, function (errorMessage) {
                dialogs.alert({
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
                dialogs.alert({
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
            dialogs.alert({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXZpZXctbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHAtdmlldy1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxJQUFPLE9BQU8sV0FBVyxZQUFZLENBQUMsQ0FBQztBQU12QyxJQUFPLFNBQVMsV0FBVyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3BELElBQU8sV0FBVyxXQUFXLHlCQUF5QixDQUFDLENBQUM7QUFDeEQsSUFBTyxRQUFRLFdBQVcsOEJBQThCLENBQUMsQ0FBQztBQWExRCxJQUFJLGNBQWMsR0FBd0I7SUFDdEMsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxFQUFFLDBCQUEwQixFQUFFO0lBQzVELEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsMEJBQTBCLEVBQUU7SUFDekQsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSwwQkFBMEIsRUFBRTtDQUN6RCxDQUFDO0FBRUYsSUFBSSxLQUFLLEdBQStCLElBQUksS0FBSyxFQUF1QixDQUFDO0FBQ3pFLElBQUksV0FBVyxHQUFtQyxJQUFJLEtBQUssRUFBMkIsQ0FBQztBQUV2RixzREFBc0Q7QUFDdEQsaUJBQWlCO0FBQ2pCLHNEQUFzRDtBQUV0RDtJQUFrQyxnQ0FBcUI7SUFPbkQ7UUFDSSxpQkFBTyxDQUFDO1FBRVIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsQyxJQUFJ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