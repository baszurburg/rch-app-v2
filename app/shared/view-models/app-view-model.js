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
                console.log('selectedNewsIndex: ' + value);
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
        console.log('In filterNews');
        console.log(typeof posts);
        this._posts = posts.filter(function (s) {
            return s.categories[0] === newsCategories[_this.selectedNewsIndex].Id;
        });
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "posts", value: this._posts });
    };
    AppViewModel.prototype.onNewsDataLoaded = function () {
        this.set("isNewsLoading", false);
        console.log('Newsdata loaded');
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
    console.log('postsFromFirebase.length: ' + postsFromFirebase.length);
    for (var i = 0; i < postsFromFirebase.length; i++) {
        var newPost = new PostModel(postsFromFirebase[i]);
        posts.push(newPost);
        console.log('posts.push');
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
            type: firebase.QueryOrderByType.KEY
        }
    }).then(function () {
        console.log("firebase.doQueryPosts done; added a listener");
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
        this.doCreateUser = function () {
            firebase.createUser({
                email: 'eddyverbruggen@gmail.com',
                password: 'firebase'
            }).then(function (result) {
                dialogs.alert({
                    title: "User created",
                    message: "userId: " + result.key,
                    okButtonText: "Nice!"
                });
            }, function (errorMessage) {
                dialogs.alert({
                    title: "No user created",
                    message: errorMessage,
                    okButtonText: "OK, got it"
                });
            });
        };
        this.doLoginByPassword = function () {
            firebase.login({
                // note that you need to enable email-password login in your firebase instance
                type: firebase.LoginType.PASSWORD,
                // note that these credentials have been configured in our firebase instance
                email: 'eddyverbruggen@gmail.com',
                password: 'firebase'
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
        this.doLogout = function () {
            firebase.logout().then(function (result) {
                dialogs.alert({
                    title: "Logout OK",
                    okButtonText: "OK, bye!"
                });
            }, function (error) {
                dialogs.alert({
                    title: "Logout error",
                    message: error,
                    okButtonText: "Hmmkay"
                });
            });
        };
        // EVENT LISTENERS
        this.doAddChildEventListenerForUsers = function () {
            var that = this;
            var onChildEvent = function (result) {
                that.set("path", '/users');
                that.set("type", result.type);
                that.set("key", result.key);
                that.set("value", JSON.stringify(result.value));
            };
            firebase.addChildEventListener(onChildEvent, "/users").then(function () {
                console.log("firebase.addChildEventListener added");
            }, function (error) {
                console.log("firebase.addChildEventListener error: " + error);
            });
        };
        this.doAddValueEventListenerForCompanies = function () {
            var path = "/companies";
            var that = this;
            var onValueEvent = function (result) {
                if (result.error) {
                    dialogs.alert({
                        title: "Listener error",
                        message: result.error,
                        okButtonText: "Darn!"
                    });
                }
                else {
                    that.set("path", path);
                    that.set("type", result.type);
                    that.set("key", result.key);
                    that.set("value", JSON.stringify(result.value));
                }
            };
            firebase.addValueEventListener(onValueEvent, path).then(function () {
                console.log("firebase.addValueEventListener added");
            }, function (error) {
                console.log("firebase.addValueEventListener error: " + error);
            });
        };
        // DATBASE ACTIONS
        this.doUserStoreByPush = function () {
            firebase.push('/users', {
                'first': 'Eddy',
                'last': 'Verbruggen',
                'birthYear': 1977,
                'isMale': true,
                'address': {
                    'street': 'foostreet',
                    'number': 123
                }
            }).then(function (result) {
                console.log("firebase.push done, created key: " + result.key);
            }, function (error) {
                console.log("firebase.push error: " + error);
            });
        };
        this.doStoreCompaniesBySetValue = function () {
            firebase.setValue('/companies', 
            // you can store a JSON object
            //{'foo':'bar'}
            // or even an array of JSON objects
            [
                {
                    name: 'Telerik',
                    country: 'Bulgaria'
                },
                {
                    name: 'Google',
                    country: 'USA'
                }
            ]).then(function () {
                console.log("firebase.setValue done");
            }, function (error) {
                console.log("firebase.setValue error: " + error);
            });
        };
        this.doRemoveUsers = function () {
            firebase.remove("/users").then(function () {
                console.log("firebase.remove done");
            }, function (error) {
                console.log("firebase.remove error: " + error);
            });
        };
        this.doRemoveCompanies = function () {
            firebase.remove("/companies").then(function () {
                console.log("firebase.remove done");
            }, function (error) {
                console.log("firebase.remove error: " + error);
            });
        };
        this.doQueryBulgarianCompanies = function () {
            var path = "/companies";
            var that = this;
            var onValueEvent = function (result) {
                // note that the query returns 1 match at a time,
                // in the order specified in the query
                console.log("Query result: " + JSON.stringify(result));
                if (result.error) {
                    dialogs.alert({
                        title: "Listener error",
                        message: result.error,
                        okButtonText: "Darn!"
                    });
                }
                else {
                    that.set("path", path);
                    that.set("type", result.type);
                    that.set("key", result.key);
                    that.set("value", JSON.stringify(result.value));
                }
            };
            firebase.query(onValueEvent, path, {
                // order by company.country
                orderBy: {
                    type: firebase.QueryOrderByType.CHILD,
                    value: 'country' // mandatory when type is 'child'
                },
                // but only companies named 'Telerik'
                // (this range relates to the orderBy clause)
                range: {
                    type: firebase.QueryRangeType.EQUAL_TO,
                    value: 'Bulgaria'
                },
                // only the first 2 matches (not that there's only 1 in this case anyway)
                limit: {
                    type: firebase.QueryLimitType.LAST,
                    value: 2
                }
            }).then(function () {
                console.log("firebase.doQueryBulgarianCompanies done; added a listener");
            }, function (errorMessage) {
                dialogs.alert({
                    title: "Login error",
                    message: errorMessage,
                    okButtonText: "OK, pity"
                });
            });
        };
        this.doQueryUsers = function () {
            var path = "/users";
            var that = this;
            var onValueEvent = function (result) {
                // note that the query returns 1 match at a time,
                // in the order specified in the query
                console.log("Query result: " + JSON.stringify(result));
                if (result.error) {
                    dialogs.alert({
                        title: "Listener error",
                        message: result.error,
                        okButtonText: "Darn!!"
                    });
                }
                else {
                    that.set("path", path);
                    that.set("type", result.type);
                    that.set("key", result.key);
                    that.set("value", JSON.stringify(result.value));
                }
            };
            firebase.query(onValueEvent, path, {
                singleEvent: true,
                orderBy: {
                    type: firebase.QueryOrderByType.KEY
                }
            }).then(function () {
                console.log("firebase.doQueryUsers done; added a listener");
            }, function (errorMessage) {
                dialogs.alert({
                    title: "Login error",
                    message: errorMessage,
                    okButtonText: "OK, pity!"
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