"use strict";
var observable = require("data/observable");
var dialogs = require("ui/dialogs");
var postModel = require("../models/posts/posts");
var firebase = require("nativescript-plugin-firebase");
var LOADING_ERROR = "Could not load latest news. Check your Internet connection and try again.";
var newsCategories = [
    { title: "Algemeen nieuws", Id: '56d61c723d4aaadc196caa4f' },
    { title: "Jeugd nieuws", Id: '56d61c893d4aaadc196caa50' },
    { title: "Verslagen", Id: '56d61c943d4aaadc196caa51' }
];
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
    // SELECT VIEW IN SIDEDRAWER
    AppViewModel.prototype.selectView = function (index, titleText) {
        this.selectedViewIndex = index;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedViewIndex", value: this.selectedViewIndex });
        this.set("actionBarTitle", titleText);
        this.set("isNewsPage", this.selectedViewIndex === 10);
    };
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
        // NEWS CATEGORY
        get: function () {
            return this._selectedNewsIndex;
        },
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
        console.log("onAgendaDataLoaded");
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
    for (var i = 0; i < postsFromFirebase.length; i++) {
        var newPost = new postModel.PostModel(postsFromFirebase[i]);
        posts.push(newPost);
    }
}
function pushAgendaItems(itemsFromFirebase) {
    // console.log('postsFromFirebase.length: ' + postsFromFirebase.length);
    // No need to sort the items
    for (var i = 0; i < itemsFromFirebase.length; i++) {
        var newAgendaItem = new AgendaModel(itemsFromFirebase[i]);
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
////////////////////////////
// MODELS
////////////////////////////
var posts = new Array();
var agendaItems = new Array();
var AgendaModel = (function (_super) {
    __extends(AgendaModel, _super);
    function AgendaModel(source) {
        _super.call(this);
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
    Object.defineProperty(AgendaModel.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AgendaModel.prototype, "allDay", {
        get: function () {
            return this._allDay;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AgendaModel.prototype, "color", {
        get: function () {
            return this._color;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AgendaModel.prototype, "description", {
        get: function () {
            return this._description;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AgendaModel.prototype, "editable", {
        get: function () {
            return this._editable;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AgendaModel.prototype, "end", {
        get: function () {
            return this._end;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AgendaModel.prototype, "location", {
        get: function () {
            return this._location;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AgendaModel.prototype, "start", {
        get: function () {
            return this._start;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AgendaModel.prototype, "title", {
        get: function () {
            return this._title;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AgendaModel.prototype, "url", {
        get: function () {
            return this._url;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AgendaModel.prototype, "eventDateTime", {
        get: function () {
            var days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
            var months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
            var startDate = new Date(this._start.toString().substr(0, 16)), startDateDayTemp = startDate.toString().substr(0, 10), startDayNumber = startDate.getDay(), startDay = startDate.getDate(), startMonth = startDate.getMonth(), startYear = startDate.getFullYear(), startHours = startDate.getHours(), startMinutes = startDate.getMinutes().toString();
            var endDate = new Date(this._end.toString().substr(0, 16)), endDateDayTemp = endDate.toString().substr(0, 10), endDayNumber = endDate.getDay(), endDay = endDate.getDate(), endMonth = endDate.getMonth(), endYear = endDate.getFullYear(), endHours = endDate.getHours(), endMinutes = endDate.getMinutes().toString();
            if (!startHours && !endHours) {
                if (startDateDayTemp === endDateDayTemp) {
                    return days[startDayNumber] + ', ' + startDay + ' ' + months[startMonth] + ' ' + startYear;
                }
                else {
                    return days[startDayNumber] + ', ' + startDay + ' ' + months[startMonth] + ' ' + startYear + ' - ' +
                        days[endDayNumber] + ', ' + endDay + ' ' + months[endMonth] + ' ' + endYear;
                }
            }
            else {
                if (startDateDayTemp === endDateDayTemp) {
                    return days[startDayNumber] + ', ' + startDay + ' ' + months[startMonth] + ' ' + startYear + ' ' + startHours + ':' + startMinutes + ' - ' + endHours + ':' + endMinutes;
                }
                else {
                    return days[startDayNumber] + ', ' + startDay + ' ' + months[startMonth] + ' ' + startYear + startHours + ':' + startMinutes + ' - ' +
                        days[endDayNumber] + ', ' + endDay + ' ' + months[endMonth] + ' ' + endYear + ' ' + endHours + ':' + endMinutes;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    return AgendaModel;
}(observable.Observable));
exports.AgendaModel = AgendaModel;
////////////////////////////////////////////////
// END MODELS
////////////////////////////////////////////////
exports.firebaseViewModel = new FirebaseModel();
exports.firebaseViewModel.doQuery('posts', function () {
    exports.appModel.onNewsDataLoaded();
});
exports.firebaseViewModel.doQuery('agenda', function () {
    null;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXZpZXctbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHAtdmlldy1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxJQUFPLE9BQU8sV0FBVyxZQUFZLENBQUMsQ0FBQztBQU12QyxJQUFPLFNBQVMsV0FBVyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3BELElBQU8sUUFBUSxXQUFXLDhCQUE4QixDQUFDLENBQUM7QUFFMUQsSUFBSSxhQUFhLEdBQUcsMkVBQTJFLENBQUM7QUFPaEcsSUFBSSxjQUFjLEdBQXdCO0lBQ3RDLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFLEVBQUUsRUFBRSwwQkFBMEIsRUFBRTtJQUM1RCxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLDBCQUEwQixFQUFFO0lBQ3pELEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsMEJBQTBCLEVBQUU7Q0FDekQsQ0FBQztBQUVGLHNEQUFzRDtBQUN0RCxpQkFBaUI7QUFDakIsc0RBQXNEO0FBRXREO0lBQWtDLGdDQUFxQjtJQU9uRDtRQUNJLGlCQUFPLENBQUM7UUFFUixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRWxDLENBQUM7SUFFRCw0QkFBNEI7SUFDckIsaUNBQVUsR0FBakIsVUFBa0IsS0FB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QUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksNEJBQUc7YUFBUDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksaUNBQVE7YUFBWjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksOEJBQUs7YUFBVDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksOEJBQUs7YUFBVDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksNEJBQUc7YUFBUDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksc0NBQWE7YUFBakI7WUFFSSxJQUFJLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzVGLElBQUksTUFBTSxHQUFHLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUUxSSxJQUFJLFNBQVMsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFDMUQsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEVBQ3BELGNBQWMsR0FBRyxTQUFT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