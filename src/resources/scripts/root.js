//
//  root.js
//  GJ_StampTour
//
//  Created by Js Na on 2023/03/20.
//  Copyright © 2023 Js Na, All rights reserved.
//

function eById(id) {
    return document.getElementById(id);
}
function eByCl(cl) {
    return document.getElementsByClassName(cl);
}
function setCookie(name, value, exp) {
    var date = new Date();
    date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);
    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';expires=' + date.toUTCString() + ';path=/;';
}
function getCookie(name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value ? value[2] : null;
}
function deleteCookie(name) {
    document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
}
function getParameter(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}
function enableCookieUpdate() {
    setInterval(function () {
        console.log("Checking for stamp updates");
        let stampCookie = getCookie("LocalStamp");
        if (stampCookie != null) {
            let stampJSON = decodeURIComponent(stampCookie);
            let stampList = JSON.parse(stampJSON);
            for (let i = 0; i < stampList.length; i++) {
                let stampData = stampList[i];
                let stampElement = eById(stampData);
                if (stampElement != null) {
                    stampElement.classList.add("checked");
                }
            }
        }
    }, 1000);
}

function getClassroomList() {
    getJSON(`/api/classList.json`, function (err, data) {
        if (err != null) {
            alert("교실 목록 데이터를 불러오는 중 오류가 발생했습니다.");
            console.error(err);
        } else if (data !== null) {
            console.log(data);
            let classList = data.classList;
            console.log(classList);
            for (let i = 0; i < classList.length; i++) {
                let classData = classList[i];
                let classElement = eById(classData.classId);
                if (classElement != null) {
                    classElement.classList.add("active");
                }
            }
        }
    });
}

function getClassroomInfo(classroomId) {
    getJSON(`/api/classroom/${classroomId}.json`, function (err, data) {
        if (err != null) {
            alert(`교실(${classroomId}) 데이터를 불러오는 중 오류가 발생했습니다.`);
            console.error(err);
        } else if (data !== null) {
            return data;
        }
    });
}

function getStampInfo(stampId) {
    getJSON(`/api/stamp/${stampId}.json`, function (err, data) {
        if (err != null) {
            alert(`스탬프(${stampId}) 데이터를 불러오는 중 오류가 발생했습니다.`);
            console.error(err);
        } else if (data !== null) {
            return data;
        }
    });
}