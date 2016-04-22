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
            console.log("selectedNewsIndex" + value);
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