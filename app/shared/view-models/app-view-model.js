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
    for (var i = 0; i < postsFromFirebase.length; i++) {
        var newPost = new PostModel(postsFromFirebase[i]);
        posts.push(newPost);
    }
}
function doQueryPosts() {
    var path = "/posts";
    var that = this;
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
}
;
// -----------------------------------------------------------
//  FIREBASE MODEL
// -----------------------------------------------------------
var FirebaseModel = (function () {
    function FirebaseModel() {
        // INIT
        this.doInit = function () {
            firebase.init({
                url: 'https://intense-heat-7311.firebaseio.com/'
            }).then(function (result) {
                dialogs.alert({
                    title: "Firebase is ready",
                    okButtonText: "Merci!"
                });
            }, function (error) {
                console.log("firebase.init error: " + error);
            });
        };
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
        // FROM HERE ARE THE RCH FUNCTIONS
        this.doPostInit = function () {
            firebase.init({
                url: 'https://intense-heat-7311.firebaseio.com/'
            }).then(function (result) {
                console.log('in postInit');
                doQueryPosts();
            }, function (error) {
                console.log("firebase.init error: " + error);
            });
        };
    }
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
    return PostModel;
}(observable.Observable));
exports.PostModel = PostModel;
exports.firebaseViewModel = new FirebaseModel();
exports.firebaseViewModel.doPostInit();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXZpZXctbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHAtdmlldy1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxJQUFPLE9BQU8sV0FBVyxZQUFZLENBQUMsQ0FBQztBQU12QyxJQUFPLFFBQVEsV0FBVyw4QkFBOEIsQ0FBQyxDQUFDO0FBRTFELElBQUksYUFBYSxHQUFHLDJFQUEyRSxDQUFDO0FBT2hHLElBQUksY0FBYyxHQUF3QjtJQUN0QyxFQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBRSxFQUFFLEVBQUUsMEJBQTBCLEVBQUU7SUFDNUQsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSwwQkFBMEIsRUFBRTtJQUN6RCxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLDBCQUEwQixFQUFFO0NBQ3pELENBQUM7QUFFRjtJQUFrQyxnQ0FBcUI7SUFNbkQ7UUFDSSxpQkFBTyxDQUFDO1FBRVIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFbEMsQ0FBQztJQUVELHNCQUFJLCtCQUFLO2FBQVQ7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN2QixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLDJDQUFpQjthQUFyQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDbkMsQ0FBQzthQUVELFVBQXNCLEtBQWE7WUFDL0Is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