import observable = require("data/observable");
import dialogs = require("ui/dialogs");
import view = require("ui/core/view");
import localSettings = require("application-settings");
import platform = require("platform");
import appModule = require("application");
import types = require("utils/types");
import firebase = require("nativescript-plugin-firebase");

var LOADING_ERROR = "Could not load sessions. Check your Internet connection and try again.";
var everlive = require("../../everlive/everlive");

interface ConferenceDay {
    date: Date;
    title: string;
}

interface NewsCategory {
    Id: string;
    title: string;
}

export interface Speaker {
    //Id: string;
    name: string;
    title: string;
    company: string;
    picture: string;
    twitterName: string;
}

export interface RoomInfo {
    roomId: string;
    name: string;
    url: string;
    theme: string;
}

export interface Session {
    Id: string;
    title: string;
    start: Date;
    end: Date;
    room: string;
    roomInfo: RoomInfo;
    speakers: Array<Speaker>;
    description: string;
    descriptionShort: string;
    calendarEventId: string;
    isBreak: boolean;
}

export interface FavouriteSession {
    sessionId: string;
    calendarEventId: string;
}

var conferenceDays: Array<ConferenceDay> = [
    { title: "WORKSHOPS", date: new Date(2015, 5, 3) },
    { title: "CONFERENCE DAY 1", date: new Date(2015, 5, 4) },
    { title: "CONFERENCE DAY 2", date: new Date(2015, 5, 5) }
];

var newsCategories: Array<NewsCategory> = [
    { title: "Algemeen nieuws", Id: '56d61c723d4aaadc196caa4f' },
    { title: "Jeugd nieuws", Id: '56d61c893d4aaadc196caa50' },
    { title: "Verslagen", Id: '56d61c943d4aaadc196caa51' }
];


var sessions: Array<SessionModel> = new Array<SessionModel>();

var REMIDER_MINUTES = 5;
var FAVOURITES = "FAVOURITES";
var favourites: Array<FavouriteSession>;
try {
    favourites = <Array<FavouriteSession>>JSON.parse(localSettings.getString(FAVOURITES, "[]"));
}
catch (error) {
    console.log("Error while retrieveing favourites: " + error);
    favourites = new Array<FavouriteSession>();
    updateFavourites();
}

function findSessionIndexInFavourites(sessionId: string): number {
    for (var i = 0; i < favourites.length; i++) {
        if (favourites[i].sessionId === sessionId) {
            return i;
        }
    }
    return -1;
}

function addToFavourites(session: SessionModel) {
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

        } else if (platform.device.os === platform.platformNames.ios) {
            var store = EKEventStore.new()
            store.requestAccessToEntityTypeCompletion(EKEntityTypeEvent, (granted: boolean, error: NSError) => {
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

                var err: NSError;
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

function persistSessionToFavourites(session: SessionModel) {
    favourites.push({
        sessionId: session.Id,
        calendarEventId: session.calendarEventId
    });
    updateFavourites();
}

function removeFromFavourites(session: SessionModel) {
    var index = findSessionIndexInFavourites(session.Id);
    if (index >= 0) {
        favourites.splice(index, 1);
        updateFavourites();
    }

    if (session.calendarEventId) {
        if (platform.device.os === platform.platformNames.android) {
            var deleteUri = android.content.ContentUris.withAppendedId(android.provider.CalendarContract.Events.CONTENT_URI, parseInt(session.calendarEventId));
            appModule.android.foregroundActivity.getApplicationContext().getContentResolver().delete(deleteUri, null, null);
        } else if (platform.device.os === platform.platformNames.ios) {
            var store = EKEventStore.new()
            store.requestAccessToEntityTypeCompletion(EKEntityTypeEvent, (granted: boolean, error: NSError) => {
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

function pushSessions(sessionsFromEvelive: Array<Session>) {
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

    el.data('Sessions').get(query).then(
        function (data) {
            pushSessions(<Array<Session>> data.result);
            loadSecondChunk();

        }, function (error) {
            dialogs.alert(LOADING_ERROR);
        });
}

function loadSecondChunk() {
    var query = new everlive.Query();
    query.order("start").skip(50).take(50).expand(expandExp);

    el.data('Sessions').get(query).then(
        function (data) {
            pushSessions(<Array<Session>> data.result);
            appModel.onDataLoaded();
        }, function (error) {
            dialogs.alert(LOADING_ERROR);
        });
}

loadFirstChunk();

export class AppViewModel extends observable.Observable {
    private _selectedIndex;
    private _selectedNewsIndex;
    private _search = "";
    private _sessions: Array<SessionModel>;
    private _posts: Array<PostModel>;

    public selectedViewIndex: number;

    constructor() {
        super();

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

    get posts(): Array<PostModel> {
        return this._posts;
    }

    get sessions(): Array<SessionModel> {
        return this._sessions;
    }

    get favorites(): Array<SessionModel> {
        return this.sessions.filter(i=> { return i.favorite });
    }

    get search(): string {
        return this._search;
    }
    set search(value: string) {
        if (this._search !== value) {
            this._search = value;
            this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "search", value: value });

            this.filter();
        }
    }

    get selectedIndex(): number {
        return this._selectedIndex;
    }
    
    get selectedNewsIndex(): number {
        return this._selectedNewsIndex;
    }
    
    
    set selectedIndex(value: number) {
        if (this._selectedIndex !== value) {
            this._selectedIndex = value;
            this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedIndex", value: value });

            this.set("dayHeader", conferenceDays[value].title);

            if (this.search !== "") {
                this.search = "";
            } else {
                this.filter();
            }
        }
    }

    set selectedNewsIndex(value: number) {
        if (this._selectedNewsIndex !== value) {
            this._selectedNewsIndex = value;
            this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedNewsIndex", value: value });

            this.set("newsHeader", newsCategories[value].title);

            console.log('selectedNewsIndex: ' + value);
            if (typeof posts === 'object') {
                 this.filterNews();
            }


        }
    }

    private filter() {
        this._sessions = sessions.filter(s=> {
            return s.start.getDate() === conferenceDays[this.selectedIndex].date.getDate()
                && s.title.toLocaleLowerCase().indexOf(this.search.toLocaleLowerCase()) >= 0;
        });

        if (this.selectedViewIndex === 0) {
            this._sessions = this._sessions.filter(i=> { return i.favorite || i.isBreak; });
        }

        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "sessions", value: this._sessions });
    }

    private filterNews() {
        console.log('In filterNews');
        console.log(typeof posts);
        this._posts = posts.filter(s=> {
            return s.categories[0] === newsCategories[this.selectedNewsIndex].Id
                && s.name.toLocaleLowerCase().indexOf(this.search.toLocaleLowerCase()) >= 0;
        });

        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "posts", value: this._posts });
    }

    public onDataLoaded() {
        this.set("isLoading", false);
        this.filter();
    }

    public onNewsDataLoaded() {
        this.set("isNewsLoading", false);
        console.log('Newsdata loaded');
        this.filterNews();
    }

    public selectView(index: number, titleText: string) {
        this.selectedViewIndex = index;
        if (this.selectedViewIndex < 2) {
            this.filter();
        }
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedViewIndex", value: this.selectedViewIndex });
        this.set("actionBarTitle", titleText);
        this.set("isSessionsPage", this.selectedViewIndex < 2);
        this.set("isNewsPage", this.selectedViewIndex === 10);
    }
    
}

export class SessionModel extends observable.Observable implements Session {
    constructor(source?: Session) {
        super();

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

    private fixDate(date: Date): Date {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }

    private _id: string;
    private _speakers: Array<Speaker>;
    private _title: string;
    private _start: Date;
    private _end: Date;
    private _room: string;
    private _roomInfo: RoomInfo;
    private _favorite: boolean;
    private _description: string;
    private _calendarEventId: string;
    private _isBreak: boolean;

    get Id(): string {
        return this._id;
    }

    get title(): string {
        return this._title;
    }

    get room(): string {
        if (this._room) {
            return this._room;
        }

        if (this._roomInfo) {
            return this._roomInfo.name
        }

        return null;
    }

    get roomInfo(): RoomInfo {
        return this._roomInfo;
    }

    get start(): Date {
        return this._start;
    }

    get end(): Date {
        return this._end;
    }

    get speakers(): Array<Speaker> {
        return this._speakers;
    }

    get range(): string {
        var startMinutes = this.start.getMinutes() + "";
        var endMinutes = this.end.getMinutes() + "";
        var startAM = this.start.getHours() < 12 ? "am" : "pm";
        var endAM = this.end.getHours() < 12 ? "am" : "pm";

        var startHours = (this.start.getHours() <= 12 ? this.start.getHours() : this.start.getHours() - 12) + "";
        var endHours = (this.end.getHours() <= 12 ? this.end.getHours() : this.end.getHours() - 12) + "";

        return (startHours.length === 1 ? '0' + startHours : startHours) + ':' + (startMinutes.length === 1 ? '0' + startMinutes : startMinutes) + startAM +
            ' - ' + (endHours.length === 1 ? '0' + endHours : endHours) + ':' + (endMinutes.length === 1 ? '0' + endMinutes : endMinutes) + endAM;
    }

    get isBreak(): boolean {
        return this._isBreak;
    }

    get favorite(): boolean {
        return this._favorite;
    }
    set favorite(value: boolean) {
        if (this._favorite !== value && !this._isBreak) {
            this._favorite = value;
            this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "favorite", value: this._favorite });
        }
    }

    get description(): string {
        return this._description;
    }

    get descriptionShort(): string {
        if (this.description.length > 160) {
            return this.description.substr(0, 160) + "...";
        }
        else {
            return this.description;
        }
    }

    public toggleFavorite() {
        this.favorite = !this.favorite;
        if (this.favorite) {
            addToFavourites(this);
        }
        else {
            removeFromFavourites(this);
        }
    }

    get calendarEventId(): string {
        return this._calendarEventId;
    }
    set calendarEventId(value: string) {
        if (this._calendarEventId !== value) {
            this._calendarEventId = value;
            this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "calendarEventId", value: this._calendarEventId });
        }
    }
}


export var appModel = new AppViewModel();

// load other info
el.data('Info').get().then(
    function (data) {
        for (var i = 0; i < data.result.length; i++) {
            var item = data.result[i];
            appModel.set("info_" + item.key, item.value);
        }
    }, function (error) {
        console.log("Could not load Info. Error: " + error);
        dialogs.alert(LOADING_ERROR);
    });

////////////////////
// FIREBASE




// MODELS

// interface Category {
//     _id: string;    
// }

interface Image {
    format: string;
    height: number;
    public_id: string;
    resource_type: string;
    secure_url: string;
    siganture: string;
    url: string;
    version: number;
    width: number;
}

export interface Content {
    brief: string;
    extended: string;
}

export interface Post {
    _id: string;
    categories: Array<string>;
    content: Content;
    externalLink: string;
    externalName: string;
    image: Image;
    locked: boolean;
    name: string;
    publishedDate: Date;
    state: string;
}

var posts: Array<PostModel> = new Array<PostModel>();

function pushPosts(postsFromFirebase: Array<Post>) {
    console.log('postsFromFirebase.length: ' + postsFromFirebase.length);
    for (var i = 0; i < postsFromFirebase.length; i++) {
        var newPost = new PostModel(postsFromFirebase[i]);
        posts.push(newPost);
        console.log('posts.push')
    }
}

function doQueryPosts () {
    var path = "/posts";
    var that = this;
    var onValueEvent = function(result) {
      // note that the query returns 1 match at a time,
      // in the order specified in the query
      //console.log("Query result: " + JSON.stringify(result));
      if (result.error) {
          dialogs.alert({
            title: "Listener error",
            message: result.error,
            okButtonText: "Darn!!"
          });
      } else {

        pushPosts(<Array<Post>> result.value);
        appModel.onNewsDataLoaded();
      
        // console.log("path: " + path);
        // console.log("type: " + result.type);
        // console.log("key: " + result.key);
        //console.log("value: " + JSON.stringify(result.value));
        
      }
    };
    firebase.query(
      onValueEvent,
      path,
      {
        singleEvent: true,
        orderBy: {
          type: firebase.QueryOrderByType.KEY
        }
      }
    ).then(
      function () {
        console.log("firebase.doQueryPosts done; added a listener");
      },
      function (errorMessage) {
        dialogs.alert({
          title: "Login error",
          message: errorMessage,
          okButtonText: "OK, pity!"
        });
      }
    );
  };

// -----------------------------------------------------------
//  FIREBASE MODEL
// -----------------------------------------------------------

export class FirebaseModel {


// INIT

  public doInit = function () {
    firebase.init({
      url: 'https://intense-heat-7311.firebaseio.com/'
    }).then(
        function (result) {
          dialogs.alert({
            title: "Firebase is ready",
            okButtonText: "Merci!"
          });
        },
        function (error) {
          console.log("firebase.init error: " + error);
        }
    );
  };

// LOGIN & USER AUTHENTICATION

  public doLoginAnonymously = function () {
    firebase.login({
      type: firebase.LoginType.ANONYMOUS
    }).then(
        function (result) {
          dialogs.alert({
            title: "Login OK",
            message: JSON.stringify(result),
            okButtonText: "Nice!"
          });
        },
        function (errorMessage) {
          dialogs.alert({
            title: "Login error",
            message: errorMessage,
            okButtonText: "OK, pity"
          });
        }
    );
  };

  public doCreateUser = function () {
    firebase.createUser({
      email: 'eddyverbruggen@gmail.com',
      password: 'firebase'
    }).then(
        function (result) {
          dialogs.alert({
            title: "User created",
            message: "userId: " + result.key,
            okButtonText: "Nice!"
          });
        },
        function (errorMessage) {
          dialogs.alert({
            title: "No user created",
            message: errorMessage,
            okButtonText: "OK, got it"
          });
        }
    );
  };

  public doLoginByPassword = function () {
    firebase.login({
      // note that you need to enable email-password login in your firebase instance
      type: firebase.LoginType.PASSWORD,
      // note that these credentials have been configured in our firebase instance
      email: 'eddyverbruggen@gmail.com',
      password: 'firebase'
    }).then(
        function (result) {
          dialogs.alert({
            title: "Login OK",
            message: JSON.stringify(result),
            okButtonText: "Nice!"
          });
        },
        function (errorMessage) {
          dialogs.alert({
            title: "Login error",
            message: errorMessage,
            okButtonText: "OK, pity"
          });
        }
    );
  };

  public doLogout = function () {
    firebase.logout().then(
        function (result) {
          dialogs.alert({
            title: "Logout OK",
            okButtonText: "OK, bye!"
          });
        },
        function (error) {
          dialogs.alert({
            title: "Logout error",
            message: error,
            okButtonText: "Hmmkay"
          });
        }
    );
  };


// EVENT LISTENERS

  public doAddChildEventListenerForUsers = function () {
    var that = this;
    var onChildEvent = function(result) {
      that.set("path", '/users');
      that.set("type", result.type);
      that.set("key", result.key);
      that.set("value", JSON.stringify(result.value));
    };

    firebase.addChildEventListener(onChildEvent, "/users").then(
        function () {
          console.log("firebase.addChildEventListener added");
        },
        function (error) {
          console.log("firebase.addChildEventListener error: " + error);
        }
    );
  };

  public doAddValueEventListenerForCompanies = function () {
    var path = "/companies";
    var that = this;
    var onValueEvent = function(result) {
      if (result.error) {
          dialogs.alert({
            title: "Listener error",
            message: result.error,
            okButtonText: "Darn!"
          });
      } else {
        that.set("path", path);
        that.set("type", result.type);
        that.set("key", result.key);
        that.set("value", JSON.stringify(result.value));
      }
    };

   firebase.addValueEventListener(onValueEvent, path).then(
        function () {
          console.log("firebase.addValueEventListener added");
        },
        function (error) {
          console.log("firebase.addValueEventListener error: " + error);
        }
    );
  };

// DATBASE ACTIONS

  public doUserStoreByPush = function () {
    firebase.push(
        '/users',
        {
          'first': 'Eddy',
          'last': 'Verbruggen',
          'birthYear': 1977,
          'isMale': true,
          'address': {
            'street': 'foostreet',
            'number': 123
          }
        }
    ).then(
        function (result) {
          console.log("firebase.push done, created key: " + result.key);
        },
        function (error) {
          console.log("firebase.push error: " + error);
        }
    );
  };

  public doStoreCompaniesBySetValue = function () {
    firebase.setValue(
        '/companies',

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
        ]
    ).then(
        function () {
          console.log("firebase.setValue done");
        },
        function (error) {
          console.log("firebase.setValue error: " + error);
        }
    );
  };

  public doRemoveUsers = function () {
    firebase.remove("/users").then(
        function () {
          console.log("firebase.remove done");
        },
        function (error) {
          console.log("firebase.remove error: " + error);
        }
    );
  };

  public doRemoveCompanies = function () {
    firebase.remove("/companies").then(
        function () {
          console.log("firebase.remove done");
        },
        function (error) {
          console.log("firebase.remove error: " + error);
        }
    );
  };

  public doQueryBulgarianCompanies = function () {
    var path = "/companies";
    var that = this;
    var onValueEvent = function(result) {
      // note that the query returns 1 match at a time,
      // in the order specified in the query
      console.log("Query result: " + JSON.stringify(result));
      if (result.error) {
          dialogs.alert({
            title: "Listener error",
            message: result.error,
            okButtonText: "Darn!"
          });
      } else {
        that.set("path", path);
        that.set("type", result.type);
        that.set("key", result.key);
        that.set("value", JSON.stringify(result.value));
      }
    };
    firebase.query(
      onValueEvent,
      path,
      {
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
      }
    ).then(
      function () {
        console.log("firebase.doQueryBulgarianCompanies done; added a listener");
      },
      function (errorMessage) {
        dialogs.alert({
          title: "Login error",
          message: errorMessage,
          okButtonText: "OK, pity"
        });
      }
    );
  };

  public doQueryUsers = function () {
    var path = "/users";
    var that = this;
    var onValueEvent = function(result) {
      // note that the query returns 1 match at a time,
      // in the order specified in the query
      console.log("Query result: " + JSON.stringify(result));
      if (result.error) {
          dialogs.alert({
            title: "Listener error",
            message: result.error,
            okButtonText: "Darn!!"
          });
      } else {
        that.set("path", path);
        that.set("type", result.type);
        that.set("key", result.key);
        that.set("value", JSON.stringify(result.value));
      }
    };
    firebase.query(
      onValueEvent,
      path,
      {
        singleEvent: true,
        orderBy: {
          type: firebase.QueryOrderByType.KEY
        }
      }
    ).then(
      function () {
        console.log("firebase.doQueryUsers done; added a listener");
      },
      function (errorMessage) {
        dialogs.alert({
          title: "Login error",
          message: errorMessage,
          okButtonText: "OK, pity!"
        });
      }
    );
  };


  // FROM HERE ARE THE RCH FUNCTIONS


  public doPostInit = function () {
    firebase.init({
      url: 'https://intense-heat-7311.firebaseio.com/'
    }).then(
        function (result) {
            console.log('in postInit');
            doQueryPosts();
        },
        function (error) {
          console.log("firebase.init error: " + error);
        }
    );
  };



}

// -----------------------------------------------------------
//  POST MODEL
// -----------------------------------------------------------

export class PostModel extends observable.Observable implements Post {
    constructor(source?: Post) {
        super();

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

    private fixDate(date: Date): Date {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }

    private __id: string;
    private _categories: Array<Category>;
    private _content: Content;
    private _externalLink: string;
    private _externalName: string;
    private _image: Image;
    private _locked: boolean;
    private _name: string;
    private _publishedDate: Date;
    private _state: string;

    get _id(): string {
        return this.__id;
    }
    
    get categories(): Array<Category> {
        return this._categories;
    }
    
    get content(): Content {
        return this._content;
    }

    get externalLink(): string {
        return this._externalLink;
    }

    get externalName(): string {
        return this._externalName;
    }

    get image(): Image {
        return this._image
    }

    get locked(): boolean {
        return this._locked;
    }

    get name(): string {
        return this._name;
    }

    get publishedDate(): Date {
        return this._publishedDate;
    }

    get state(): string {
        return this._state;
    }

}

export var firebaseViewModel = new FirebaseModel();

firebaseViewModel.doPostInit();