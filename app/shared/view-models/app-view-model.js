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
        this.selectedViewIndex = 1;
        this.set("actionBarTitle", "All sessions");
        this.set("isLoading", true);
        this.set("isSessionsPage", true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXZpZXctbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHAtdmlldy1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxJQUFPLE9BQU8sV0FBVyxZQUFZLENBQUMsQ0FBQztBQUV2QyxJQUFPLGFBQWEsV0FBVyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3ZELElBQU8sUUFBUSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBQ3RDLElBQU8sU0FBUyxXQUFXLGFBQWEsQ0FBQyxDQUFDO0FBQzFDLElBQU8sS0FBSyxXQUFXLGFBQWEsQ0FBQyxDQUFDO0FBRXRDLElBQUksYUFBYSxHQUFHLHdFQUF3RSxDQUFDO0FBQzdGLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBeUNsRCxJQUFJLGNBQWMsR0FBeUI7SUFDdkMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0lBQ2xELEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0lBQ3pELEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0NBQzVELENBQUM7QUFFRixJQUFJLFFBQVEsR0FBd0IsSUFBSSxLQUFLLEVBQWdCLENBQUM7QUFFOUQsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLElBQUksVUFBVSxHQUFHLFlBQVksQ0FBQztBQUM5QixJQUFJLFVBQW1DLENBQUM7QUFDeEMsSUFBSSxDQUFDO0lBQ0QsVUFBVSxHQUE0QixJQUFJLENBQUMsS0FBSyxDQUFD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