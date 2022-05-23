"use strict";

const container404 = document.getElementById("container404");

const schoolPos = {
    latitude: 51.071059,
    longitude: -114.132435
};

const mainButton = document.getElementById("mainButton"),
    mainInput = document.getElementById("mainInput");

let watcher, solutionElement;

let solution;

let device;

//Konami code
let konami = {
    correctSequence: "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba",
    currentSequence: [null, null, null, null, null, null, null, null, null, null],
    disabledKeys: []
};

function init() {
    let secretPuzzles = localStorage.getItem("secretPuzzles");
    if (secretPuzzles == null) {
        secretPuzzles = {};
    } else {
        secretPuzzles = JSON.parse(secretPuzzles);
    }

    if (!secretPuzzles.geolocation) {
        //Get or generate the random seed for this user - persists across sessions
        if (localStorage.getItem("device") == null) {
            device = Math.random().toString();
            localStorage.setItem("device", device);
        } else {
            device = localStorage.getItem("device");
        }

        solution = genRandomSequence(device);

        mainButton.onclick = checkInput;

        //Register the event listener for the enter key on the input box to submit the response to the puzzle
        mainInput.addEventListener("keypress", function (e) {
            if (e.key == "Enter") {
                checkInput();
            }
        });

        //Start the puzzle
        if (navigator.geolocation) {
            //We can do this puzzle
            watcher = navigator.geolocation.watchPosition(checkLocationPuzzle, errorHandler);
        }
    } else {
        //Puzzle already completed
        container404.innerHTML =
            "Well. Hmm. I think you might be lost. Try using the buttons at the top right to get where you're going.<br /><br /><br />You've already completed this puzzle. You can't do it again.";
    }

    //Register the event listeners for the konami code
    window.addEventListener("keydown", function (e) {
        if (!konami.disabledKeys.includes(e.key)) {
            konami.currentSequence.push(e.key);
            konami.currentSequence.shift();

            if (konami.currentSequence.join("") == konami.correctSequence) {
                //Show the hidden puzzle
                localStorage.setItem("doKonami", "true");
                window.location = "/";
            }

            konami.disabledKeys.push(e.key);
        }
    });
    window.addEventListener("keyup", function (e) {
        if (konami.disabledKeys.includes(e.key)) {
            konami.disabledKeys.splice(konami.disabledKeys.indexOf(e.key), 1);
        }
    });
}

function checkInput() {
    if (mainInput.value == solution) {
        //Puzzle complete
        let secretPuzzles = localStorage.getItem("secretPuzzles");
        if (secretPuzzles == null) {
            secretPuzzles = {};
        } else {
            secretPuzzles = JSON.parse(secretPuzzles);
        }
        secretPuzzles.geolocation = true;
        localStorage.setItem("secretPuzzles", JSON.stringify(secretPuzzles));

        //Delete the input box and update the message
        container404.innerHTML =
            "Well. Hmm. I think you might be lost. Try using the buttons at the top right to get where you're going.<br /><br /><br />You've already completed this puzzle. You can't do it again.";

        //Stop the watcher for position
        navigator.geolocation.clearWatch(watcher);

        //Remove the solution element if it exists
        if (solutionElement != undefined) {
            solutionElement.remove();
        }
    }
}

function checkLocationPuzzle(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    let error = position.coords.accuracy;

    //Calculate distance to school in meters
    let distToSchool =
        Math.sqrt((schoolPos.latitude - latitude) ** 2 + (schoolPos.longitude - longitude) ** 2) *
        111000;

    if (distToSchool - error > 500) {
        //We aren't near the school - puzzle is complete
        if (solutionElement == undefined) {
            solutionElement = document.createElement("div");
            solutionElement.classList.add("bigCenterText");
            solutionElement.innerHTML = solution;

            document.body.appendChild(solutionElement);
        }
    } else {
        //We are near the school
        if (solutionElement != undefined) {
            solutionElement.remove();
            solutionElement = undefined;
        }
    }
}

function errorHandler(error) {
    console.error(error);
}

function genRandomSequence(seed) {
    let seededRandom = new Math.seedrandom(seed);

    let sequence = "";
    for (let i = 0; i < 3; i++) {
        sequence += randomBetween(0, 9, seededRandom);
    }
    for (let i = 0; i < 3; i++) {
        sequence += "abcdefghijklmnopqrstuvwxyz"[randomBetween(0, 25, seededRandom)];
    }
    sequence += "!@#$%^&*(+-=[};:/>?~"[randomBetween(0, 19, seededRandom)];

    //Shuffle the sequence
    var a = sequence.split(""),
        n = sequence.length;

    for (let i = n - 1; i > 0; i--) {
        let j = Math.floor(seededRandom() * (i + 1));

        let tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }

    sequence = a.join("");

    if (sequence.length != 7) {
        console.error("Huh? " + sequence.length + "**" + sequence + "**");
    }
    return sequence;
}

//Generate a random number between min and max (inclusive)
function randomBetween(min, max, seededFunction) {
    return Math.floor(seededFunction() * (max - min + 1)) + min;
}

//Seeded random number generator, many thanks to David Bau
// prettier-ignore
!function(f,a,c){var s,l=256,p="random",d=c.pow(l,6),g=c.pow(2,52),y=2*g,h=l-1;function n(n,t,r){function e(){for(var n=u.g(6),t=d,r=0;n<g;)n=(n+r)*l,t*=l,r=u.g(1);for(;y<=n;)n/=2,t/=2,r>>>=1;return(n+r)/t}var o=[],i=j(function n(t,r){var e,o=[],i=typeof t;if(r&&"object"==i)for(e in t)try{o.push(n(t[e],r-1))}catch(n){}return o.length?o:"string"==i?t:t+"\0"}((t=1==t?{entropy:!0}:t||{}).entropy?[n,S(a)]:null==n?function(){try{var n;return s&&(n=s.randomBytes)?n=n(l):(n=new Uint8Array(l),(f.crypto||f.msCrypto).getRandomValues(n)),S(n)}catch(n){var t=f.navigator,r=t&&t.plugins;return[+new Date,f,r,f.screen,S(a)]}}():n,3),o),u=new m(o);return e.int32=function(){return 0|u.g(4)},e.quick=function(){return u.g(4)/4294967296},e.double=e,j(S(u.S),a),(t.pass||r||function(n,t,r,e){return e&&(e.S&&v(e,u),n.state=function(){return v(u,{})}),r?(c[p]=n,t):n})(e,i,"global"in t?t.global:this==c,t.state)}function m(n){var t,r=n.length,u=this,e=0,o=u.i=u.j=0,i=u.S=[];for(r||(n=[r++]);e<l;)i[e]=e++;for(e=0;e<l;e++)i[e]=i[o=h&o+n[e%r]+(t=i[e])],i[o]=t;(u.g=function(n){for(var t,r=0,e=u.i,o=u.j,i=u.S;n--;)t=i[e=h&e+1],r=r*l+i[h&(i[e]=i[o=h&o+t])+(i[o]=t)];return u.i=e,u.j=o,r})(l)}function v(n,t){return t.i=n.i,t.j=n.j,t.S=n.S.slice(),t}function j(n,t){for(var r,e=n+"",o=0;o<e.length;)t[h&o]=h&(r^=19*t[h&o])+e.charCodeAt(o++);return S(t)}function S(n){return String.fromCharCode.apply(0,n)}if(j(c.random(),a),"object"==typeof module&&module.exports){module.exports=n;try{s=require("crypto")}catch(n){}}else"function"==typeof define&&define.amd?define(function(){return n}):c["seed"+p]=n}("undefined"!=typeof self?self:this,[],Math);

init();
