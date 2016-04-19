"use strict";
var observable = require("data/observable");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbmRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWdlbmRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLFVBQVUsV0FBVyxpQkFBaUIsQ0FBQyxDQUFDO0FBeUIvQztJQUFpQywrQkFBcUI7SUFDbEQscUJBQVksTUFBZTtRQUN2QixpQkFBTyxDQUFDO1FBRVIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNULElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQzNCLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztZQUN2QyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDakMsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQzNCLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUMzQixDQUFDO0lBQ0wsQ0FBQztJQWFELHNCQUFJLDJCQUFFO2FBQU47WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNwQixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLCtCQUFNO2FBQVY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLDhCQUFLO2FBQVQ7WUFDSSxNQUFNLENBQUMsSUFBSSxD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