"use strict";
var observable = require("data/observable");
var dialogs = require("ui/dialogs");
var firebase = require("nativescript-plugin-firebase");
var posts = new Array();
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
            console.log("path: " + path);
            console.log("type: " + result.type);
            console.log("key: " + result.key);
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
            title: "Login error",
            message: errorMessage,
            okButtonText: "OK, pity!"
        });
    });
}
;
// -----------------------------------------------------------
//  FIREBASE MODEL
// -----------------------------------------------------------
var FirebaseModel = (function (_super) {
    __extends(FirebaseModel, _super);
    function FirebaseModel() {
        _super.call(this);
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
        this._posts = posts;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "posts", value: this._posts });
        console.log('in constructor');
    }
    Object.defineProperty(FirebaseModel.prototype, "posts", {
        get: function () {
            return this._posts;
        },
        enumerable: true,
        configurable: true
    });
    return FirebaseModel;
}(observable.Observable));
exports.FirebaseModel = FirebaseModel;
// -----------------------------------------------------------
//  POST MODEL
// -----------------------------------------------------------
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZWJhc2Utdmlldy1tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZpcmViYXNlLXZpZXctbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQU8sVUFBVSxXQUFXLGlCQUFpQixDQUFDLENBQUM7QUFDL0MsSUFBTyxPQUFPLFdBQVcsWUFBWSxDQUFDLENBQUM7QUFFdkMsSUFBTyxRQUFRLFdBQVcsOEJBQThCLENBQUMsQ0FBQztBQXVDMUQsSUFBSSxLQUFLLEdBQXFCLElBQUksS0FBSyxFQUFhLENBQUM7QUFFckQsbUJBQW1CLGlCQUE4QjtJQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDaEQsSUFBSSxPQUFPLEdBQUcsSUFBSSxTQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDN0IsQ0FBQztBQUNMLENBQUM7QUFFRDtJQUNJLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQztJQUNwQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7SUFDaEIsSUFBSSxZQUFZLEdBQUcsVUFBUyxNQUFNO1FBQ2hDLGlEQUFpRDtRQUNqRCxzQ0FBc0M7UUFDdEMseURBQXlEO1FBQ3pELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDWixLQUFLLEVBQUUsZ0JBQWdCO2dCQUN2QixPQUFPLEVBQUUsTUFBTSxDQUFDLEtBQUs7Z0JB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