"use strict";
var observable = require("data/observable");
var dialogs = require("ui/dialogs");
var firebase = require("nativescript-plugin-firebase");
var LOADING_ERROR = "Could not load latest news. Check your Internet connection and try again.";
var newsCategories = [
    { title: "Algemeen nieuws", Id: '56d61c723d4aaadc196caa4f' },
    { title: "Jeugd nieuws", Id: '56d61c893d4aaadc196caa50' },
    { title: "Verslagen", Id: '56d61c943d4aaadc196caa51' }
];
var AppViewModel = (function (_super) {
    __extends(AppViewModel, _super);
    function AppViewModel() {
        _super.call(this);
        this.selectedNewsIndex = 0;
        this.selectedViewIndex = 5;
        this.set("actionBarTitle", "Thuis");
        this.set("isNewsLoading", true);
        this.set("isNewsPage", false);
    }
    Object.defineProperty(AppViewModel.prototype, "posts", {
        get: function () {
            return this._posts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppViewModel.prototype, "selectedNewsIndex", {
        get: function () {
            return this._selectedNewsIndex;
        },
        set: function (value) {
            if (this._selectedNewsIndex !== value) {
                this._selectedNewsIndex = value;
                this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedNewsIndex", value: value });
                this.set("newsHeader", newsCategories[value].title);
                // console.log('selectedNewsIndex: ' + value);
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
    AppViewModel.prototype.onNewsDataLoaded = function () {
        this.set("isNewsLoading", false);
        this.filterNews();
    };
    AppViewModel.prototype.selectView = function (index, titleText) {
        this.selectedViewIndex = index;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedViewIndex", value: this.selectedViewIndex });
        this.set("actionBarTitle", titleText);
        this.set("isNewsPage", this.selectedViewIndex === 10);
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
        var newPost = new PostModel(postsFromFirebase[i]);
        posts.push(newPost);
    }
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
    FirebaseModel.prototype.doQueryPosts = function () {
        var path = "/posts";
        var onValueEvent = function (result) {
            // note that the query returns 1 match at a time,
            // in the order specified in the query
            //console.log("Query result: " + JSON.stringify(result));
            if (result.error) {
                dialogs.alert({
                    title: "Listener error",
                    message: result.error,
                    okButtonText: "Darn!!"
                });
            }
            else {
                // ToDo work here with a promise       
                pushPosts(result.value);
                exports.appModel.onNewsDataLoaded();
            }
        };
        firebase.query(onValueEvent, path, {
            singleEvent: true,
            orderBy: {
                type: firebase.QueryOrderByType.CHILD,
                value: 'publishedDate'
            }
        }).then(function () {
            // console.log("firebase.doQueryPosts done; added a listener");
        }, function (errorMessage) {
            dialogs.alert({
                title: "Fout lezen gegevens",
                message: errorMessage,
                okButtonText: "OK"
            });
        });
    };
    ;
    return FirebaseModel;
}());
exports.FirebaseModel = FirebaseModel;
var posts = new Array();
var PostModel = (function (_super) {
    __extends(PostModel, _super);
    function PostModel(source) {
        _super.call(this);
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
        }
    }
    PostModel.prototype.fixDate = function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    };
    Object.defineProperty(PostModel.prototype, "_id", {
        get: function () {
            return this.__id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostModel.prototype, "categories", {
        get: function () {
            return this._categories;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostModel.prototype, "content", {
        get: function () {
            return this._content;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostModel.prototype, "externalLink", {
        get: function () {
            return this._externalLink;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostModel.prototype, "externalName", {
        get: function () {
            return this._externalName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostModel.prototype, "image", {
        get: function () {
            return this._image;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostModel.prototype, "locked", {
        get: function () {
            return this._locked;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostModel.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostModel.prototype, "publishedDate", {
        get: function () {
            return this._publishedDate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostModel.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostModel.prototype, "dateFormatted", {
        get: function () {
            var dateZ = new Date(this._publishedDate.toString().substr(0, 10));
            var day = dateZ.getDate();
            var month = dateZ.getMonth() + 1;
            var year = dateZ.getFullYear();
            return day + '-' + month + '-' + year;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostModel.prototype, "dateFormattedFull", {
        // ToDo: fille in the days and month
        get: function () {
            var dateZ = new Date(this._publishedDate.toString().substr(0, 10));
            var dayNumber = dateZ.getDay();
            var day = dateZ.getDate();
            var month = dateZ.getMonth() + 1;
            var year = dateZ.getFullYear();
            var days = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag',];
            // Doe vandaag, gisteren
            // daarna dag, datum (met maand uitgeschreven)
            // na een week alleen de datum met maand uitgeschreven
            return days[dayNumber] + ', ' + day + '-' + month + '-' + year;
        },
        enumerable: true,
        configurable: true
    });
    return PostModel;
}(observable.Observable));
exports.PostModel = PostModel;
exports.firebaseViewModel = new FirebaseModel();
exports.firebaseViewModel.doQueryPosts();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXZpZXctbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHAtdmlldy1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxJQUFPLE9BQU8sV0FBVyxZQUFZLENBQUMsQ0FBQztBQU12QyxJQUFPLFFBQVEsV0FBVyw4QkFBOEIsQ0FBQyxDQUFDO0FBRTFELElBQUksYUFBYSxHQUFHLDJFQUEyRSxDQUFDO0FBT2hHLElBQUksY0FBYyxHQUF3QjtJQUN0QyxFQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBRSxFQUFFLEVBQUUsMEJBQTBCLEVBQUU7SUFDNUQsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSwwQkFBMEIsRUFBRTtJQUN6RCxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLDBCQUEwQixFQUFFO0NBQ3pELENBQUM7QUFFRjtJQUFrQyxnQ0FBcUI7SUFNbkQ7UUFDSSxpQkFBTyxDQUFDO1FBRVIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFbEMsQ0FBQztJQUVELHNCQUFJLCtCQUFLO2FBQVQ7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN2QixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLDJDQUFpQjthQUFyQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDbkMsQ0FBQzthQUVELFVBQXNCLEtBQWE7WUFDL0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLFlBQVksRUFBRSxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFFckksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUVwRCw4Q0FBOEM7Z0JBQzlDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzVCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDdEIsQ0FBQztZQUVMLENBQUM7UUFDTCxDQUFDOzs7T0FmQTtJQWlCTyxpQ0FBVSxHQUFsQjtRQUFBLGlCQVFDO1FBUEcsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQztZQUN4QixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssY0FBYyxDQUFDLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUN6RSxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNuSSxDQUFDO0lBRU0sdUNBQWdCLEdBQXZCO1FBQ0ksSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFakMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFTSxpQ0FBVSxHQUFqQixVQUFrQixLQUFhLEVBQUUsU0FBaUI7UUFDOUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxZQUFZLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFDdEosSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsaUJBQWlCLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVMLG1CQUFDO0FBQUQsQ0FBQyxBQS9ERCxDQUFrQyxVQUFVLENBQUMsVUFBVSxHQStEdEQ7QUEvRFksb0JBQVksZUErRHhCLENBQUE7QUFFVSxnQkFBUSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7QUFFekMsbUJBQW1CLGlCQUE4QjtJQUM3Qyx3RUFBd0U7SUFFeEUsb0NBQW9DO0lBQ3BDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFTLENBQUMsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzSCxDQUFDLENBQUMsQ0FBQztJQUVILEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDaEQsSUFBSSxPQUFPLEdBQUcsSUFBSSxTQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXhCLENBQUM7QUFDTCxDQUFDO0FBR0QsOERBQThEO0FBQzlELGtCQUFrQjtBQUNsQiw4REFBOEQ7QUFFOUQ7SUFBQTtRQUVJLDhCQUE4QjtRQUV2Qix1QkFBa0IsR0FBRztZQUN4QixRQUFRLENBQUMsS0FBSyxDQUFDO2dCQUNYLElBQUksRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVM7YUFDckMsQ0FBQyxDQUFDLElBQUksQ0FDSCxVQUFTLE1BQU07Z0JBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQztvQkFDVixLQUFLLEVBQUUsVUFBVTtvQkFDakIsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO29CQUMvQixZQUFZLEVBQUUsT0FBTztpQkFDeEIsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxFQUNELFVBQVMsWUFBWTtnQkFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQztvQkFDVixLQUFLLEVBQUUsYUFBYTtvQkFDcEIsT0FBTyxFQUFFLFlBQVk7b0JBQ3JCLFlBQVksRUFBRSxVQUFVO2lCQUMzQixDQUFDLENBQUM7WUFDUCxDQUFDLENBQ0EsQ0FBQztRQUNWLENBQUMsQ0FBQztJQW9ETixDQUFDO0lBbERHLGtDQUFrQztJQUcvQixvQ0FBWSxHQUFuQjtRQUNJLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQztRQUNwQixJQUFJLFlBQVksR0FBRyxVQUFTLE1BQU07WUFDOUIsaURBQWlEO1lBQ2pELHNDQUFzQztZQUN0Qyx5REFBeUQ7WUFDekQsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQztvQkFDVixLQUFLLEVBQUUsZ0JBQWdCO29CQUN2QixPQUFPLEVBQUUsTUFBTSxDQUFDLEtBQUs7b0JBQ3JCLFlBQVksRUFBRSxRQUFRO2lCQUN6QixDQUFDLENBQUM7WUFDUCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRVIsdUNBQXVDO2dCQUNuQyxTQUFTLENBQWMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUVyQyxnQkFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFFaEMsQ0FBQztRQUNMLENBQUMsQ0FBQztRQUNGLFFBQVEsQ0FBQyxLQUFLLENBQ1YsWUFBWSxFQUNaLElBQUksRUFDSjtZQUNJLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLE9BQU8sRUFBRTtnQkFDTCxJQUFJLEVBQUUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEtBQUs7Z0JBQ3JDLEtBQUssRUFBRSxlQUFlO2FBQ3pCO1NBQ0osQ0FDSixDQUFDLElBQUksQ0FDRjtZQUNJLCtEQUErRDtRQUNuRSxDQUFDLEVBQ0QsVUFBUyxZQUFZO1lBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQ1YsS0FBSyxFQUFFLHFCQUFxQjtnQkFDNUIsT0FBTyxFQUFFLFlBQVk7Z0JBQ3JCLFlBQVksRUFBRSxJQUFJO2FBQ3JCLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FDQSxDQUFDO0lBQ1YsQ0FBQzs7SUFJRCxvQkFBQztBQUFELENBQUMsQUEzRUQsSUEyRUM7QUEzRVkscUJBQWEsZ0JBMkV6QixDQUFBO0FBNENELElBQUksS0FBSyxHQUFxQixJQUFJLEtBQUssRUFBYSxDQUFDO0FBRXJEO0lBQStCLDZCQUFxQjtJQUNoRCxtQkFBWSxNQUFhO1FBQ3JCLGlCQUFPLENBQUM7UUFFUixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ1QsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztZQUNyQyxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7WUFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztZQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7WUFDM0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQy9CLENBQUM7SUFDTCxDQUFDO0lBRU8sMkJBQU8sR0FBZixVQUFnQixJQUFVO1FBQ3RCLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQ2xKLENBQUM7SUFhRCxzQkFBSSwwQkFBRzthQUFQO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSxpQ0FBVTthQUFkO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDNUIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSw4QkFBTzthQUFYO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSxtQ0FBWTthQUFoQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzlCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksbUNBQVk7YUFBaEI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUM5QixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLDRCQUFLO2FBQVQ7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUN0QixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLDZCQUFNO2FBQVY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLDJCQUFJO2FBQVI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLG9DQUFhO2FBQWpCO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDL0IsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSw0QkFBSzthQUFUO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSxvQ0FBYTthQUFqQjtZQUNJLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMxQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUUvQixNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQztRQUUxQyxDQUFDOzs7T0FBQTtJQUdELHNCQUFJLHdDQUFpQjtRQURyQixvQ0FBb0M7YUFDcEM7WUFDSSxJQUFJLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzFCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDakMsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRS9CLElBQUksSUFBSSxHQUFHLENBQUMsU0FBUyxFQUFDLFNBQVMsRUFBQyxVQUFVLEVBQUMsV0FBVyxFQUFDLFNBQVMsRUFBQyxVQUFVLEVBQUMsUUFBUSxFQUFHLENBQUE7WUFFdkYsd0JBQXdCO1lBQ3hCLDhDQUE4QztZQUM5QyxzREFBc0Q7WUFFdEQsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQztRQUVuRSxDQUFDOzs7T0FBQTtJQUdMLGdCQUFDO0FBQUQsQ0FBQyxBQXRHRCxDQUErQixVQUFVLENBQUMsVUFBVSxHQXNHbkQ7QUF0R1ksaUJBQVMsWUFzR3JCLENBQUE7QUFFVSx5QkFBaUIsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO0FBRW5ELHlCQUFpQixDQUFDLFlBQVksRUFBRSxDQUFDIn0=