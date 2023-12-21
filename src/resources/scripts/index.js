//
//  index.js
//  GJ_StampTour
//
//  Created by Js Na on 2023/12/12.
//  Copyright © 2023 Js Na, All rights reserved.
//
/* 주요 변수 선언 */
let CurrentFloor = 1;
let guidePage = 0;
let uA = window.navigator.userAgent.toLowerCase();

/* Element Outlet */
let classroomList = eByCl("classroom");
let notClassroomList = eByCl("notClassroom");
let StampView = eById("StampView");
let stampListView = eById("stampList");
let GuideModalContainer = eById("GuideModalContainer");
let ClassInfoModalContainer = eById("ClassInfoModalContainer");
let ClassInfoModalTitle = eById("ClassInfoModalTitle");
let VideoPlayer = eById("GuideVideo");
let GuideHint = eById("GuideHint");
let GuideText = eById("GuideText");
let NextGuideButton = eById("NextGuideButton");

let StudentIdInput = eById("StudentIdInput");
let StudentNameInput = eById("StudentNameInput");

function init() {
        setStampView();
        getStampList();
        enableCookieUpdate();
}
function getStampList() {
    getJSON(`/api/stampList.json`, function (err, data) {
        if (err != null) {
            alert("스탬프 목록 데이터를 불러오는 중 오류가 발생했습니다.");
        } else if (data !== null) {
            let sL = data.stampList;
            for (let i = 0; i < sL.length; i++) {
                let sD = sL[i];
                let stampElement = document.createElement("div");
                stampElement.classList.add("stamp");
                stampElement.id = sD.stampId;
                stampElement.innerHTML = `<img src="/images/circle.svg"><img class="CheckMark" src="/images/check.svg"><span><h2>${sD.stampName}</h2><p>${sD.stampLocation}</p></span>`;
                eById("stampList").appendChild(stampElement);
            }
        }
    });
}

function enableMapZoom(mapElement) {
    if ('ontouchstart' in window || navigator.msMaxTouchPoints) {
        zoom = panzoom(mapElement, {
            bounds: true,
            boundsPadding: 0,
            maxZoom: 2,
            minZoom: 0.3,
            zoomDoubleClickSpeed: 1,
            onTouch: (e) => {
                const t = e.target;
                let ttn = t.tagName;
                let ttc = t.classList[0];
                if ((ttc != "hallway" && ttc != "notClassroom") && (ttn === "g" || ttn === "rect" || ttn === "text")) {
                    return false;
                } else {
                    e.preventDefault();
                }
            }
        });
    } else {
        zoom = panzoom(mapElement, {
            bounds: true,
            boundsPadding: -0.5,
            maxZoom: 5,
            minZoom: 0.5,
            zoomDoubleClickSpeed: 1,
            contain: 'outside'
        });
    }
}
function animateFloorChange(f) {
    let CurrentFloorMap = eById(`Floor${CurrentFloor}MapView`);
    let NewFloorMap = eById(`Floor${f}MapView`);
    eById(`Floor${CurrentFloor}`).classList.remove("selected");
    eById(`Floor${f}`).classList.add("selected");
    CurrentFloorMap.classList.remove("active");
    NewFloorMap.classList.add("active");
    CurrentFloor = f;
}
function setStampView() {
    let StampView = eById("StampView");
    eById("StampView").addEventListener("click", function () {
        eById("StampView").classList.toggle("open");
    });
    eById("ShowGuideButton").addEventListener("click", function () {
        eById("GuideModalContainer").style.display = "flex";
        showNextGuide();
    });
}
function showNextGuide() {
    NextGuideButton.disabled = true;
    VideoPlayer.play();
    VideoPlayer.pause();
    VideoPlayer.style.opacity = 1;
    switch (guidePage) {
        case 0:
            VideoPlayer.currentTime = 0;
            if (window.screen.width > 1024) {
                GuideText.innerText = `${displayDeviceType}에서는 "태그 스캔" 버튼을 눌러서 참여할 수 있어요.`;
            } else {
                GuideText.innerText = `${displayDeviceType}의 NFC 인식 위치는 ${displayNFCLocation}이에요.`;
            }
            setTimeout(() => {
                VideoPlayer.play();
                setTimeout(() => {
                    VideoPlayer.pause();
                    NextGuideButton.disabled = false;
                }, 840);
                guidePage += 1;
            }, 500);
            break;
        case 1:
            VideoPlayer.play();
            if (window.screen.width > 1024) {
                GuideText.innerText = `스탬프의 아이콘을 카메라로 스캔해 주세요.`;
            } else {
                GuideText.innerText = `스탬프의 아이콘에 ${displayDeviceType}의 ${displayNFCLocation}을 대주세요.`;
            }
            setTimeout(() => {
                VideoPlayer.pause();
                NextGuideButton.disabled = false;
                eById("ReplayButtonContainer").style.visibility = "visible";
            }, 4000);
            guidePage += 1;
            break;
        case 2:
            NextGuideButton.disabled = true;
            NextGuideButton.innerText = "시작하기";
            GuideText.style.display = "none";
            VideoPlayer.style.display = "none";
            eById("ReplayButtonContainer").style.display = "none";
            eById("PrivacyPolicyCheckboxContainer").style.display = "flex";

            eById("GuideTitle").innerText = "시작 전 본인의 정보를 알려주세요";
            GuideHint.innerText = "타인의 정보를 도용할 경우 불이익이 있을 수 있습니다.";
            GuideHint.style.color = "#FF0000";

            StudentIdInput.addEventListener("input", () => {
                StudentIdInput.value = StudentIdInput.value.replace(/[^0-9]/g, '');
                let l = StudentIdInput.value.length;
                if (l >= 6) {
                    StudentIdInput.value = StudentIdInput.value.slice(0, 5);
                } else if (l >= 5) {
                    StudentNameInput.focus();
                }
            });
            StudentNameInput.addEventListener("input", () => {
                let l = StudentNameInput.value.length;
                if (l >= 2) {
                    NextGuideButton.disabled = false;
                } else {
                    NextGuideButton.disabled = true;
                }
            });
            StudentIdInput.style.display = "block";
            StudentNameInput.style.display = "block";
            setTimeout(() => {
                StudentIdInput.classList.add("show");
                StudentNameInput.classList.add("show");
            }, 100);
            guidePage += 1;
            break;
        case 3:
            var xhr = new XMLHttpRequest();
            xhr.open('POST', "/login", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.responseType = 'json';
            xhr.onload = function () {
                var status = xhr.status;
                if (status === 200) {
                    console.log(xhr.response);
                    alert(`${xhr.response.user_name}(${xhr.response.user_id})님, 환영합니다.)`);
                    setCookie("user_id", xhr.response.user_id, 7);
                    setCookie("user_name", StudentIdInput.value + StudentNameInput.value, 7);
                    setCookie("ShowGuide", "true", 1);
                    guidePage = 0;
                    GuideModalContainer.style.display = "none";
                } else {
                    console.warn(xhr.response);
                    alert(`로그인에 실패했습니다. 다시 시도해 주세요.`);
                }
            };
            xhr.send(`{ "user_name": "${StudentIdInput.value}${StudentNameInput.value}" }`); // 보낼 데이터 지정
            break;
        default:
            break;
    }
}
function loadGuideVideo(deviceType) {
    let source1 = document.createElement("source");
    source1.src = `/videos/Guide_NFC_${deviceType}.webm`;
    source1.type = "video/webm";
    let source2 = document.createElement("source");
    source2.src = `/videos/Guide_NFC_${deviceType}.mov`;
    source2.type = "video/mp4";
    VideoPlayer.appendChild(source1);
    VideoPlayer.appendChild(source2);
}
function checkDirection() {
    if (touchendY < touchstartY) {
        if (!StampView.classList.contains("open")) {
            StampView.classList.toggle("open");
        }
    } else if (touchendY > touchstartY) {
        if (StampView.classList.contains("open")) {
            StampView.classList.toggle("open");
        }
    }
};

for (let i = 1; i <= 4; i++) { // Loop from 1 to 4 (number of floors)
    enableMapZoom(eById(`Floor${i}MapView`)); // Constructing the map ID dynamically
}

for (let i = 1; i <= 4; i++) {
    eById(`Floor${i}`).addEventListener("click", () => animateFloorChange(i));
}
if (window.location.hash.startsWith("#Floor")) {
    animateFloorChange(window.location.hash.replace("#Floor", ""));
}
// MapContainer get child element that has class "classroom"
console.log(classroomList);
for (let i = 0; i < classroomList.length; i++) {
    classroomList[i].addEventListener("click", () => {
        console.log(classroomList[i].id);
        ClassInfoModalContainer.style.display = "flex";
        ClassInfoModalTitle.innerText = classroomList[i].id;
    });
}
for (let i = 0; i < notClassroomList.length; i++) {
    notClassroomList[i].addEventListener("click", () => {
        alert(`${notClassroomList[i].id} 부스 정보가 없습니다.`);
    });
}

window.onload = function () {
    init();
    getClassroomList();
    if (getCookie("ShowGuide") == null) {
        GuideModalContainer.style.display = "flex";
        showNextGuide();
    }
}


StampView.addEventListener('touchstart', e => {
    const t = e.target;
    let ttn = t.tagName;
    let ttc = t.classList[0];
    if ((stampListView.scrollTop <= 0) || (t != stampListView && ttc != "stamp" && ttn != "span" && ttn != "img" && ttn != "h2" && ttn != "p")) {
        touchstartY = e.changedTouches[0].screenY;
    } else {
        touchstartY = 0;
    }
});
let touchstartY = 0;
let touchendY = 0;

StampView.addEventListener('touchend', e => {
    const t = e.target;
    let ttn = t.tagName;
    let ttc = t.classList[0];
    if ((stampListView.scrollTop <= 0) || (t != stampListView && ttc != "stamp" && ttn != "span" && ttn != "img" && ttn != "h2" && ttn != "p")) {
        touchendY = e.changedTouches[0].screenY;
        checkDirection();
    }
});
eById("ClassInfoModalCloseButton").addEventListener("click", () => {
    ClassInfoModalContainer.style.display = "none";
});
NextGuideButton.addEventListener("click", showNextGuide);

let displayDeviceType = "접속하신 기기";
let displayNFCLocation = "후면 중앙";
if (window.screen.width > 1024) {
    loadGuideVideo("NoNFC");
    displayDeviceType = "태블릿 또는 NFC 기능이 없는 휴대전화";
} else if (uA.includes("iphone")) {
    displayDeviceType = "iPhone";
    displayNFCLocation = "상단";
    loadGuideVideo("iPhone");
    document.ondblclick = function (e) {
        e.preventDefault();
    }
} else if (uA.includes("sm-f700") || uA.includes("sm-f711") || uA.includes("sm-f721") || uA.includes("sm-f731")) {
    displayDeviceType = "갤럭시 Z 플립";
    displayNFCLocation = "후면 하단";
    loadGuideVideo("Bottom");
} else {
    loadGuideVideo("Center");
}

GuideHint.innerText = `${displayDeviceType}에서의 참여 방법을 알려 드릴게요.`;
eById("ReplayGuideButton").addEventListener("click", () => {
    guidePage = 0;
    showNextGuide();
});

VideoPlayer.pause();
