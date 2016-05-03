"use strict";
var observable = require("data/observable");
var AgendaModel = (function (_super) {
    __extends(AgendaModel, _super);
    function AgendaModel(source) {
        _super.call(this);
        console.log("in constructor agenda model");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbmRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWdlbmRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLFVBQVUsV0FBVyxpQkFBaUIsQ0FBQyxDQUFDO0FBeUIvQztJQUFpQywrQkFBcUI7SUFDbEQscUJBQVksTUFBZTtRQUN2QixpQkFBTyxDQUFDO1FBRVIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBRTNDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDVCxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUMzQixJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7WUFDdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztZQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDM0IsQ0FBQztJQUNMLENBQUM7SUFhRCxzQkFBSSwyQkFBRTthQUFOO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDcEIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSwrQkFBTTthQUFWO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEIsQ0FBQzs7O09BQUE7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