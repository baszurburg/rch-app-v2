"use strict";
var observable = require("data/observable");
var dialogs = require("ui/dialogs");
var localSettings = require("application-settings");
var platform = require("platform");
var appModule = require("application");
var types = require("utils/types");
var firebase = require("nativescript-plugin-firebase");
var LOADING_ERROR = "Could not load sessions. Check your Internet connection and try again.";
var everlive = require("../../everlive/everlive");
var conferenceDays = [
    { title: "WORKSHOPS", date: new Date(2015, 5, 3) },
    { title: "CONFERENCE DAY 1", date: new Date(2015, 5, 4) },
    { title: "CONFERENCE DAY 2", date: new Date(2015, 5, 5) }
];
var newsCategories = [
    { title: "Algemeen nieuws", Id: '56d61c723d4aaadc196caa4f' },
    { title: "Jeugd nieuws", Id: '56d61c893d4aaadc196caa50' },
    { title: "Verslagen", Id: '56d61c943d4aaadc196caa51' }
];
var sessions = new Array();
var REMIDER_MINUTES = 5;
var FAVOURITES = "FAVOURITES";
var favourites;
try {
    favourites = JSON.parse(localSettings.getString(FAVOURITES, "[]"));
}
catch (error) {
    console.log("Error while retrieveing favourites: " + error);
    favourites = new Array();
    updateFavourites();
}
function findSessionIndexInFavourites(sessionId) {
    for (var i = 0; i < favourites.length; i++) {
        if (favourites[i].sessionId === sessionId) {
            return i;
        }
    }
    return -1;
}
function addToFavourites(session) {
    if (findSessionIndexInFavourites(session.Id) >= 0) {
        // Sesson already added to favourites.
        return;
    }
    try {
        if (platform.device.os === platform.platformNames.android) {
            var projection = java.lang.reflect.Array.newInstance(java.lang.String.class, 1);
            projection[0] = "_id";
            var calendars = android.net.Uri.parse("content://com.android.calendar/calendars");
            var contentResolver = appModule.android.foregroundActivity.getApplicationContext().getContentResolver();
            var managedCursor = contentResolver.query(calendars, projection, null, null, null);
            var calID;
            if (managedCursor.moveToFirst()) {
                var idCol = managedCursor.getColumnIndex(projection[0]);
                calID = managedCursor.getString(idCol);
                managedCursor.close();
            }
            if (types.isUndefined(calID)) {
                // No caledndar to add to
                return;
            }
            var timeZone = java.util.TimeZone.getTimeZone("GMT-05:00");
            var startDate = session.start.getTime();
            var endDate = session.end.getTime();
            var values = new android.content.ContentValues();
            values.put("calendar_id", calID);
            values.put("eventTimezone", timeZone.getID());
            values.put("dtstart", java.lang.Long.valueOf(startDate));
            values.put("dtend", java.lang.Long.valueOf(endDate));
            values.put("title", session.title);
            values.put("eventLocation", session.room);
            var uri = contentResolver.insert(android.provider.CalendarContract.Events.CONTENT_URI, values);
            var eventId = uri.getLastPathSegment();
            session.calendarEventId = eventId;
            var reminderValues = new android.content.ContentValues();
            reminderValues.put("event_id", java.lang.Long.valueOf(java.lang.Long.parseLong(eventId)));
            reminderValues.put("method", java.lang.Long.valueOf(1)); // METHOD_ALERT
            reminderValues.put("minutes", java.lang.Long.valueOf(REMIDER_MINUTES));
            contentResolver.insert(android.provider.CalendarContract.Reminders.CONTENT_URI, reminderValues);
            persistSessionToFavourites(session);
        }
        else if (platform.device.os === platform.platformNames.ios) {
            var store = EKEventStore.new();
            store.requestAccessToEntityTypeCompletion(EKEntityTypeEvent, function (granted, error) {
                if (!granted) {
                    return;
                }
                var event = EKEvent.eventWithEventStore(store);
                event.title = session.title;
                event.timeZone = NSTimeZone.alloc().initWithName("UTC-05:00");
                event.startDate = NSDate.dateWithTimeIntervalSince1970(session.start.getTime() / 1000);
                event.endDate = NSDate.dateWithTimeIntervalSince1970(session.end.getTime() / 1000);
                event.calendar = store.defaultCalendarForNewEvents;
                event.location = session.room;
                event.addAlarm(EKAlarm.alarmWithRelativeOffset(-REMIDER_MINUTES * 60));
                var err;
                var result = store.saveEventSpanCommitError(event, EKSpan.EKSpanThisEvent, true);
                session.calendarEventId = event.eventIdentifier;
                persistSessionToFavourites(session);
            });
        }
    }
    catch (error) {
        console.log("Error while creating calendar event: " + error);
    }
}
function persistSessionToFavourites(session) {
    favourites.push({
        sessionId: session.Id,
        calendarEventId: session.calendarEventId
    });
    updateFavourites();
}
function removeFromFavourites(session) {
    var index = findSessionIndexInFavourites(session.Id);
    if (index >= 0) {
        favourites.splice(index, 1);
        updateFavourites();
    }
    if (session.calendarEventId) {
        if (platform.device.os === platform.platformNames.android) {
            var deleteUri = android.content.ContentUris.withAppendedId(android.provider.CalendarContract.Events.CONTENT_URI, parseInt(session.calendarEventId));
            appModule.android.foregroundActivity.getApplicationContext().getContentResolver().delete(deleteUri, null, null);
        }
        else if (platform.device.os === platform.platformNames.ios) {
            var store = EKEventStore.new();
            store.requestAccessToEntityTypeCompletion(EKEntityTypeEvent, function (granted, error) {
                if (!granted) {
                    return;
                }
                var eventToRemove = store.eventWithIdentifier(session.calendarEventId);
                if (eventToRemove) {
                    store.removeEventSpanCommitError(eventToRemove, EKSpan.EKSpanThisEvent, true);
                    session.calendarEventId = undefined;
                }
            });
        }
    }
}
function updateFavourites() {
    var newValue = JSON.stringify(favourites);
    console.log("favourites: " + newValue);
    localSettings.setString(FAVOURITES, newValue);
}
var el = new everlive({
    apiKey: 'mzacGkKPFlZUfbMq',
    scheme: 'https'
});
var expandExp = {
    "speakers": true,
    "roomInfo": true
};
function pushSessions(sessionsFromEvelive) {
    for (var i = 0; i < sessionsFromEvelive.length; i++) {
        var newSession = new SessionModel(sessionsFromEvelive[i]);
        var indexInFavs = findSessionIndexInFavourites(newSession.Id);
        if (indexInFavs >= 0) {
            newSession.favorite = true;
            newSession.calendarEventId = favourites[indexInFavs].calendarEventId;
        }
        sessions.push(newSession);
    }
}
function loadFirstChunk() {
    var query = new everlive.Query();
    query.order("start").take(50).expand(expandExp);
    el.data('Sessions').get(query).then(function (data) {
        pushSessions(data.result);
        loadSecondChunk();
    }, function (error) {
        dialogs.alert(LOADING_ERROR);
    });
}
function loadSecondChunk() {
    var query = new everlive.Query();
    query.order("start").skip(50).take(50).expand(expandExp);
    el.data('Sessions').get(query).then(function (data) {
        pushSessions(data.result);
        exports.appModel.onDataLoaded();
    }, function (error) {
        dialogs.alert(LOADING_ERROR);
    });
}
loadFirstChunk();
var AppViewModel = (function (_super) {
    __extends(AppViewModel, _super);
    function AppViewModel() {
        _super.call(this);
        this._search = "";
        this.selectedIndex = 0;
        this.selectedNewsIndex = 0;
        this.selectedViewIndex = 1;
        this.set("actionBarTitle", "All sessions");
        this.set("isLoading", true);
        this.set("isNewsLoading", true);
        this.set("isSessionsPage", true);
        this.set("isNewsPage", false);
        // this._posts = posts;
        // this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "posts", value: this._posts });
    }
    Object.defineProperty(AppViewModel.prototype, "posts", {
        get: function () {
            return this._posts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppViewModel.prototype, "sessions", {
        get: function () {
            return this._sessions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppViewModel.prototype, "favorites", {
        get: function () {
            return this.sessions.filter(function (i) { return i.favorite; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppViewModel.prototype, "search", {
        get: function () {
            return this._search;
        },
        set: function (value) {
            if (this._search !== value) {
                this._search = value;
                this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "search", value: value });
                this.filter();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppViewModel.prototype, "selectedIndex", {
        get: function () {
            return this._selectedIndex;
        },
        set: function (value) {
            if (this._selectedIndex !== value) {
                this._selectedIndex = value;
                this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedIndex", value: value });
                this.set("dayHeader", conferenceDays[value].title);
                if (this.search !== "") {
                    this.search = "";
                }
                else {
                    this.filter();
                }
            }
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
    AppViewModel.prototype.filter = function () {
        var _this = this;
        this._sessions = sessions.filter(function (s) {
            return s.start.getDate() === conferenceDays[_this.selectedIndex].date.getDate()
                && s.title.toLocaleLowerCase().indexOf(_this.search.toLocaleLowerCase()) >= 0;
        });
        if (this.selectedViewIndex === 0) {
            this._sessions = this._sessions.filter(function (i) { return i.favorite || i.isBreak; });
        }
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "sessions", value: this._sessions });
    };
    AppViewModel.prototype.filterNews = function () {
        var _this = this;
        console.log('In filterNews');
        console.log(typeof posts);
        this._posts = posts.filter(function (s) {
            return s.categories[0] === newsCategories[_this.selectedNewsIndex].Id
                && s.name.toLocaleLowerCase().indexOf(_this.search.toLocaleLowerCase()) >= 0;
        });
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "posts", value: this._posts });
    };
    AppViewModel.prototype.onDataLoaded = function () {
        this.set("isLoading", false);
        this.filter();
    };
    AppViewModel.prototype.onNewsDataLoaded = function () {
        this.set("isNewsLoading", false);
        console.log('Newsdata loaded');
        this.filterNews();
    };
    AppViewModel.prototype.selectView = function (index, titleText) {
        this.selectedViewIndex = index;
        if (this.selectedViewIndex < 2) {
            this.filter();
        }
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedViewIndex", value: this.selectedViewIndex });
        this.set("actionBarTitle", titleText);
        this.set("isSessionsPage", this.selectedViewIndex < 2);
        this.set("isNewsPage", this.selectedViewIndex === 10);
    };
    return AppViewModel;
}(observable.Observable));
exports.AppViewModel = AppViewModel;
var SessionModel = (function (_super) {
    __extends(SessionModel, _super);
    function SessionModel(source) {
        _super.call(this);
        if (source) {
            this._id = source.Id;
            this._title = source.title;
            this._room = source.room;
            this._roomInfo = source.roomInfo;
            this._start = this.fixDate(source.start);
            this._end = this.fixDate(source.end);
            this._speakers = source.speakers;
            this._description = source.description;
            this._isBreak = source.isBreak;
        }
    }
    SessionModel.prototype.fixDate = function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    };
    Object.defineProperty(SessionModel.prototype, "Id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionModel.prototype, "title", {
        get: function () {
            return this._title;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionModel.prototype, "room", {
        get: function () {
            if (this._room) {
                return this._room;
            }
            if (this._roomInfo) {
                return this._roomInfo.name;
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionModel.prototype, "roomInfo", {
        get: function () {
            return this._roomInfo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionModel.prototype, "start", {
        get: function () {
            return this._start;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionModel.prototype, "end", {
        get: function () {
            return this._end;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionModel.prototype, "speakers", {
        get: function () {
            return this._speakers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionModel.prototype, "range", {
        get: function () {
            var startMinutes = this.start.getMinutes() + "";
            var endMinutes = this.end.getMinutes() + "";
            var startAM = this.start.getHours() < 12 ? "am" : "pm";
            var endAM = this.end.getHours() < 12 ? "am" : "pm";
            var startHours = (this.start.getHours() <= 12 ? this.start.getHours() : this.start.getHours() - 12) + "";
            var endHours = (this.end.getHours() <= 12 ? this.end.getHours() : this.end.getHours() - 12) + "";
            return (startHours.length === 1 ? '0' + startHours : startHours) + ':' + (startMinutes.length === 1 ? '0' + startMinutes : startMinutes) + startAM +
                ' - ' + (endHours.length === 1 ? '0' + endHours : endHours) + ':' + (endMinutes.length === 1 ? '0' + endMinutes : endMinutes) + endAM;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionModel.prototype, "isBreak", {
        get: function () {
            return this._isBreak;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionModel.prototype, "favorite", {
        get: function () {
            return this._favorite;
        },
        set: function (value) {
            if (this._favorite !== value && !this._isBreak) {
                this._favorite = value;
                this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "favorite", value: this._favorite });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionModel.prototype, "description", {
        get: function () {
            return this._description;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SessionModel.prototype, "descriptionShort", {
        get: function () {
            if (this.description.length > 160) {
                return this.description.substr(0, 160) + "...";
            }
            else {
                return this.description;
            }
        },
        enumerable: true,
        configurable: true
    });
    SessionModel.prototype.toggleFavorite = function () {
        this.favorite = !this.favorite;
        if (this.favorite) {
            addToFavourites(this);
        }
        else {
            removeFromFavourites(this);
        }
    };
    Object.defineProperty(SessionModel.prototype, "calendarEventId", {
        get: function () {
            return this._calendarEventId;
        },
        set: function (value) {
            if (this._calendarEventId !== value) {
                this._calendarEventId = value;
                this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "calendarEventId", value: this._calendarEventId });
            }
        },
        enumerable: true,
        configurable: true
    });
    return SessionModel;
}(observable.Observable));
exports.SessionModel = SessionModel;
exports.appModel = new AppViewModel();
// load other info
el.data('Info').get().then(function (data) {
    for (var i = 0; i < data.result.length; i++) {
        var item = data.result[i];
        exports.appModel.set("info_" + item.key, item.value);
    }
}, function (error) {
    console.log("Could not load Info. Error: " + error);
    dialogs.alert(LOADING_ERROR);
});
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
exports.firebaseViewModel.doPostInit();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXZpZXctbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHAtdmlldy1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxJQUFPLE9BQU8sV0FBVyxZQUFZLENBQUMsQ0FBQztBQUV2QyxJQUFPLGFBQWEsV0FBVyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3ZELElBQU8sUUFBUSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBQ3RDLElBQU8sU0FBUyxXQUFXLGFBQWEsQ0FBQyxDQUFDO0FBQzFDLElBQU8sS0FBSyxXQUFXLGFBQWEsQ0FBQyxDQUFDO0FBQ3RDLElBQU8sUUFBUSxXQUFXLDhCQUE4QixDQUFDLENBQUM7QUFFMUQsSUFBSSxhQUFhLEdBQUcsd0VBQXdFLENBQUM7QUFDN0YsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUErQ2xELElBQUksY0FBYyxHQUF5QjtJQUN2QyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7SUFDbEQsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7SUFDekQsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Q0FDNUQsQ0FBQztBQUVGLElBQUksY0FBYyxHQUF3QjtJQUN0QyxFQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBRSxFQUFFLEVBQUUsMEJBQTBCLEVBQUU7SUFDNUQsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSwwQkFBMEIsRUFBRTtJQUN6RCxFQUFF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R0FBRyxFQUFFLENBQUM7WUFDNUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztZQUN2RCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBRW5ELElBQUksVUFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN6RyxJQUFJLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFakcsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLFVBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsWUFBWSxHQUFHLFlBQVksQ0FBQyxHQUFHLE9BQU87Z0JBQzlJLEtBQUssR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLFVBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDOUksQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSxpQ0FB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