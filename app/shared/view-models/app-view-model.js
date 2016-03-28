"use strict";
var observable = require("data/observable");
var dialogs = require("ui/dialogs");
var localSettings = require("application-settings");
var platform = require("platform");
var appModule = require("application");
var types = require("utils/types");
var LOADING_ERROR = "Could not load sessions. Check your Internet connection and try again.";
var everlive = require("../../everlive/everlive");
var conferenceDays = [
    { title: "WORKSHOPS", date: new Date(2015, 5, 3) },
    { title: "CONFERENCE DAY 1", date: new Date(2015, 5, 4) },
    { title: "CONFERENCE DAY 2", date: new Date(2015, 5, 5) }
];
// ToDo: use filter for categories
var newsCategories = [
    { title: "Algemeen nieuws", date: new Date(2015, 5, 3) },
    { title: "Jeugd nieuws", date: new Date(2015, 5, 4) },
    { title: "Verslagen", date: new Date(2015, 5, 5) }
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
        this.set("isSessionsPage", true);
        this.set("isNewsPage", false);
    }
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
            if (this._selectedIndex !== value) {
                this._selectedIndex = value;
                this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "selectedNewsIndex", value: value });
                this.set("newsHeader", newsCategories[value].title);
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
    AppViewModel.prototype.onDataLoaded = function () {
        this.set("isLoading", false);
        this.filter();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXZpZXctbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHAtdmlldy1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxJQUFPLE9BQU8sV0FBVyxZQUFZLENBQUMsQ0FBQztBQUV2QyxJQUFPLGFBQWEsV0FBVyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3ZELElBQU8sUUFBUSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBQ3RDLElBQU8sU0FBUyxXQUFXLGFBQWEsQ0FBQyxDQUFDO0FBQzFDLElBQU8sS0FBSyxXQUFXLGFBQWEsQ0FBQyxDQUFDO0FBRXRDLElBQUksYUFBYSxHQUFHLHdFQUF3RSxDQUFDO0FBQzdGLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBMENsRCxJQUFJLGNBQWMsR0FBeUI7SUFDdkMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0lBQ2xELEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0lBQ3pELEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0NBQzVELENBQUM7QUFFRixrQ0FBa0M7QUFDbEMsSUFBSSxjQUFjLEdBQXlCO0lBQ3ZDLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0lBQ3hELEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsSUFBSSxJQUFJ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