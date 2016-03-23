"use strict";
var http = require("http");
var imageSource = require("image-source");
var imageCache = require("ui/image-cache");
var officeRnDApi = "https://www.officernd.com/api/v1/";
var cache = new imageCache.Cache();
exports.defaultNotFoundImageSource = imageSource.fromFile("~/images/no-map.png");
cache.maxRequests = 5;
function getImage(uri, done) {
    var source = cache.get(uri);
    if (source) {
        done(source);
    }
    else {
        cache.push({
            key: uri,
            url: uri,
            completed: function (result, key) {
                if (key === uri) {
                    done(result);
                }
            }
        });
    }
}
function getRoomImage(info, update) {
    var getRoomImageUri;
    if (info.url) {
        getRoomImageUri = info.url;
    }
    else {
        getRoomImageUri = officeRnDApi + "rooms/" + info.roomId + "/export-uri?theme=" + info.theme;
    }
    console.log("Loading: " + getRoomImageUri);
    http.getJSON(getRoomImageUri)
        .then(function (res) {
        var uri = "https:" + res.uri;
        // TODO: Read room name from the endpoint
        console.log("Loading image: " + uri);
        getImage(uri, function (image) {
            console.log("Image downloaded");
            update(image);
        });
    }, function (err) {
        console.log("ERROR: " + err);
        update(exports.defaultNotFoundImageSource);
    });
}
exports.getRoomImage = getRoomImage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2ZmaWNlUm5EQXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsib2ZmaWNlUm5EQXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLElBQUksV0FBVyxNQUFNLENBQUMsQ0FBQztBQUM5QixJQUFPLFdBQVcsV0FBVyxjQUFjLENBQUMsQ0FBQztBQUM3QyxJQUFPLFVBQVUsV0FBVyxnQkFBZ0IsQ0FBQyxDQUFDO0FBSTlDLElBQUksWUFBWSxHQUFHLG1DQUFtQyxDQUFDO0FBQ3ZELElBQUksS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3hCLGtDQUEwQixHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUVwRixLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztBQUV0QixrQkFBa0IsR0FBRyxFQUFFLElBQUk7SUFDdkIsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUU1QixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pCLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNKLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDUCxHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1lBQ1IsU0FBUyxFQUFFLFVBQVUsTUFBTSxFQUFFLEdBQUc7Z0JBQzVCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDakIsQ0FBQztZQUNMLENBQUM7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0FBQ0wsQ0FBQztBQUVELHNCQUE2QixJQUEyQixFQUFFLE1BQWdEO0lBQ3RHLElBQUksZUFBZSxDQUFDO0lBQ3BCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ1gsZUFBZSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDL0IsQ0FBQztJQUNELElBQUksQ0FBQyxDQUFDO1FBQ0YsZUFBZSxHQUFHLFlBQVksR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ2hHLENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxlQUFlLENBQUMsQ0FBQztJQUMzQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQztTQUN4QixJQUFJLENBQUMsVUFBVSxHQUFHO1FBQ2YsSUFBSSxHQUFHLEdBQUcsUUFBUSxHQUFTLEdBQUksQ0FBQyxHQUFHLENBQUM7UUFDcEMseUNBQXlDO1FBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDckMsUUFBUSxDQUFDLEdBQUcsRUFBRSxVQUFVLEtBQUs7WUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsRUFBRSxVQUFVLEdBQUc7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsa0NBQTBCLENBQUMsQ0FBQztJQUN2QyxDQUFDLENBQUMsQ0FBQztBQUNYLENBQUM7QUF2QmUsb0JBQVksZUF1QjNCLENBQUEifQ==