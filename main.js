/**
 * Hi! Looks like you're viewing the source code of these puzzles!
 * There aren't any hints or solutions in here, if that's what you're
 * looking for. I kept this code readable on purpose - I've learned a
 * lot about programming by reading other people's code. However, if
 * you're just reading this to spoil the puzzles, keep in mind that
 * the puzzles themselves are probably more fun than just changing a
 * variable or two!
 *
 * Good luck!
 *
 * -Jacob Guglielmin, Class of 2022
 */

"use strict";

const overridePuzzle = null;
const newDevice = false;

//Puzzle on
let puzzle = undefined;
let curSolution = undefined;

//Time tracking
let puzzleTimeElapsed, globalTimeElapsed;
let timeTrackingInterval = null;

//Device random seed - generated on first visit and persists across sessions
let device;

//For use with the time puzzle
let timePuzzle = {
    charElement: undefined,
    updateHandler: undefined,
    lastDate: undefined
};

//Audio stuff
let audio = {};

let removeOnNextPuzzle;

const mainText = document.getElementById("mainText"),
    mainInput = document.getElementById("mainInput"),
    mainButton = document.getElementById("mainButton"),
    puzzleOnElement = document.getElementById("puzzleOn"),
    puzzleTicker = document.getElementById("puzzleTimer"),
    globalTicker = document.getElementById("globalTimer");

function init() {
    //Get or generate the random seed for this user - persists across sessions
    if (localStorage.getItem("device") == null || newDevice) {
        device = Math.random().toString();
        localStorage.setItem("device", device);
    } else {
        device = localStorage.getItem("device");
    }

    if (overridePuzzle != null) {
        localStorage.setItem("puzzleOn", overridePuzzle);
    }

    //Get the time trackers from localStorage
    if (localStorage.getItem("puzzleTimeElapsed") != null) {
        puzzleTimeElapsed = parseInt(localStorage.getItem("puzzleTimeElapsed"));
    } else {
        puzzleTimeElapsed = 0;
    }
    if (localStorage.getItem("globalTimeElapsed") != null) {
        globalTimeElapsed = parseInt(localStorage.getItem("globalTimeElapsed"));
    } else {
        globalTimeElapsed = 0;
    }

    //Show the console message and comment in the DOM tree
    let commentText =
        "Hi! Looks like you're poking around in the console! There will NEVER be any hints or solutions in here, if that's what you're looking for. All of the code for these puzzles is readable on purpose - I've learned a lot about programming by reading and tinkering with other people's code. However, if you're just here to spoil the puzzles, keep in mind that the puzzles themselves are probably more fun than just changing a variable or two!\n\nGood luck!\n\n-Jacob Guglielmin, Class of 2022";
    console.log("%c" + commentText, "font-size: 1.25em; font-weight: bold;");
    document.prepend(document.createComment(commentText));

    //Get the puzzle that the user is at from localStorage, or INTRO if entry is null
    puzzle = localStorage.getItem("puzzleOn") || "INTRO";

    //Get ready for audio stuff
    audio.context = new AudioContext();

    //Check if the user has read the introduction
    if (puzzle == "INTRO") {
        //Display the introduction
        displayPuzzle("INTRO");
    } else {
        //Check if the user is using a mobile device
        if (navigator.maxTouchPoints != 0) {
            //Display the warning
            displayPuzzle("0");
        } else {
            //Display the current puzzle
            displayPuzzle(puzzle);
        }
    }

    //Register the event listener for the enter key on the input box to submit the response to the puzzle
    mainInput.addEventListener("keypress", function (e) {
        if (e.key == "Enter") {
            checkInput();
        }
    });
}

function nextPuzzle(cameFromTouchCheck) {
    //Elements needing to be removed from the DOM will be assigned to removeOnNextPuzzle, so delete them now
    if (removeOnNextPuzzle != undefined) {
        removeOnNextPuzzle.remove();
        removeOnNextPuzzle = undefined;
    }

    //If we just showed the touchscreen warning and we aren't on puzzle zero right now, don't increment - that would skip a puzzle
    if (cameFromTouchCheck == true && puzzle != "0") {
        return displayPuzzle(puzzle);
    }

    if (puzzle == "INTRO") {
        //Set the puzzle to the first puzzle
        puzzle = "0";
    } else {
        //Save the puzzle clear time to localStorage
        let times = localStorage.getItem("puzzleTimes");
        if (times == null) {
            times = [];
        } else {
            times = JSON.parse(times);
        }
        if (puzzle != 0) {
            times[puzzle] = puzzleTimeElapsed;
        }
        localStorage.setItem("puzzleTimes", JSON.stringify(times));

        //Increment the puzzle number
        puzzle = (parseInt(puzzle) + 1).toString();

        //Reset the puzzle ticker
        puzzleTimeElapsed = 0;
    }

    //Set the local storage to the next puzzle
    localStorage.setItem("puzzleOn", puzzle);

    //Display the next puzzle
    displayPuzzle(puzzle);
}

function checkInput() {
    if (curSolution == mainInput.value) {
        //Display the next puzzle
        nextPuzzle();
    } else {
        //Shake the input box
        shake(mainInput);

        //If we got the answer wrong on puzzle 1, redisplay the puzzle to prevent brute-forcing it without understanding how the puzzles work
        if (puzzle == "1") {
            displayPuzzle("1");
        }
    }
}

function displayPuzzle(id) {
    //Clear the main input
    mainInput.value = "";

    //Display the current puzzle
    puzzleOnElement.innerHTML = id;

    switch (id) {
        case "INTRO":
            mainText.innerHTML =
                "Hi there! You must've just scanned the QR code on my legacy tile! I made a series of (hopefully fun) puzzles that you can try out. Just a quick warning in advance - these puzzles do get quite difficult (I mean, this is Westmount, after all). Each of the puzzles is very different than each of the others, but many will require you to use some form of external tools of your choosing. If you do decide to try these out, I hope you enjoy them! For those of you who are already thinking about it, just letting you know that viewing the page source will spoil many of the puzzles.";
            mainButton.innerHTML = "Got it!";
            mainButton.onclick = nextPuzzle;
            showElements(mainButton);
            hideElements(mainInput);

            document.body.style.overflowY = "scroll";
            break;

        case "0":
            //TOUCHSCREEN WARNING

            //Check if we even need to show this one - skip if we are not using a touchscreen
            if (navigator.maxTouchPoints == 0) {
                return nextPuzzle(true);
            }

            mainText.innerHTML =
                "Looks like you're using a touchscreen. Makes sense - you probably got here from a QR code.<br>Almost all of these puzzles are not designed to be played on any sort of mobile device, so you should visit this website on your computer if you want to try them.<br>Call it puzzle 0, if you like.<br><br>(If you're just on a laptop with a touchscreen, you can click the button below to ignore this and continue, but keep in mind these won't work on phones and tablets.)";
            mainButton.innerHTML = "Continue (NOT RECOMMENDED)";
            mainButton.onclick = () => {
                nextPuzzle(true);
            };
            showElements(mainButton);
            hideElements(mainInput);

            document.body.style.overflowY = "scroll";
            break;

        case "1":
            //CODE VALIDATION

            mainText.innerHTML =
                "All of these puzzles are solved by identifying and providing a specific code. These codes are 7 characters long, and contain three numbers, three letters, and a symbol. To make sure you've got all that, I'll make this first puzzle easy. Just put the correct solution in the box, and hit Submit!<br>";

            //Create a valid sequence for the answer
            curSolution = genRandomSequence(true);

            let solutionsTable = document.createElement("table");
            solutionsTable.classList.add("solutionsTable");
            for (let i = 0; i < 5; i++) {
                let curRow = solutionsTable.insertRow();
                for (let j = 0; j < 5; j++) {
                    curRow.insertCell().innerHTML =
                        genRandomSequence(false).sanitize();
                }
            }

            //Set a random cell to the current solution
            solutionsTable.rows[randomBetween(0, 4)].cells[
                randomBetween(0, 4)
            ].innerHTML = curSolution.sanitize();

            mainText.appendChild(solutionsTable);

            doAlways();
            break;

        case "2":
            //OFFSCREEN ELEMENT

            mainText.innerHTML =
                "Ok, that last one was pretty easy. You're going to have to think outside the box a little bit on this one.";

            //Create an element to hold the code, and put it slightly offscreen
            let offscreenElement = document.createElement("div");
            offscreenElement.classList.add("offscreenElement");
            offscreenElement.style.left = 1.1 * window.innerWidth + "px";
            offscreenElement.style.top = "50vh";

            curSolution = genRandomSequence(true);

            offscreenElement.innerHTML = curSolution.sanitize();

            document.body.appendChild(offscreenElement);

            removeOnNextPuzzle = offscreenElement;

            doAlways();
            break;

        case "3":
            //TIME

            //We will update mainText from updateTimePuzzle - that's why it's not here

            //This is kinda complicated. We create a new valid sequence, but we use a seeded random number generator to make sure it stays the same.
            //We seed with the current date, so it resets every day, and we also use the random number assigned to this user to ensure it isn't the same for everyone playing that day.
            curSolution = genRandomSequence(
                true,
                new Date().toLocaleString().split(",")[0] + device
            );

            //Create the element to display the characters
            timePuzzle.charElement = document.createElement("div");
            timePuzzle.charElement.classList.add("timeChar");
            //Set the character
            updateTimePuzzle();

            //Register the handler to update the characters
            timePuzzle.updateHandler = setInterval(updateTimePuzzle, 1000);

            //Add the element to the page
            document.body.appendChild(timePuzzle.charElement);

            removeOnNextPuzzle = timePuzzle.charElement;

            doAlways();
            break;

        case "4":
            //AUDIO

            mainText.innerHTML = "Audio puzzle 1";

            //Select three different notes to play, including exactly one sharp, and calculate their frequencies
            const notes = {
                c: 261.63,
                d: 293.66,
                e: 329.63,
                f: 349.23,
                g: 392.0,
                a: 440.0,
                b: 493.88
            };
            const sharps = {
                "c#": 277.18,
                "d#": 311.13,
                "f#": 369.99,
                "g#": 415.3,
                "a#": 466.16
            };
            let notesSelected = [];
            notesSelected.push(
                Object.keys(sharps)[
                    randomBetween(0, Object.keys(sharps).length - 1)
                ] + randomBetween(4, 5)
            );
            notesSelected.push(
                Object.keys(notes)[
                    randomBetween(0, Object.keys(notes).length - 1)
                ] + randomBetween(4, 5)
            );
            while (
                notesSelected.length < 3 ||
                notesSelected[1] == notesSelected[2]
            ) {
                notesSelected.push(
                    Object.keys(notes)[
                        randomBetween(0, Object.keys(notes).length - 1)
                    ] + randomBetween(4, 5)
                );
            }
            shuffleArray(notesSelected);

            //Set the solution to the note names
            curSolution = notesSelected.join("");

            //Calculate the frequencies of the selected notes
            notesSelected = notesSelected.map((x) => {
                let freq;

                let noteName = x.substring(0, x.length - 1);
                let octave = parseInt(x.substring(x.length - 1));

                if (sharps[noteName]) {
                    freq = sharps[noteName];
                } else {
                    freq = notes[noteName];
                }

                freq *= Math.pow(2, octave - 4);

                return freq;
            });

            //Create a button to play the notes
            let playSoundButton = document.createElement("button");
            playSoundButton.innerHTML = "Play";
            playSoundButton.onclick = () => {
                playTones(
                    { pitch: notesSelected[0], volume: 0.5, time: 1 },
                    { pitch: notesSelected[1], volume: 0.5, time: 1 },
                    { pitch: notesSelected[2], volume: 0.5, time: 1 }
                );
            };

            document.body.appendChild(playSoundButton);

            removeOnNextPuzzle = playSoundButton;

            doAlways();
            break;

        case "5":
            //CONTRAST

            mainText.innerHTML = "Contrast puzzle";

            curSolution = genRandomSequence(true);

            //Create the element to hold each character
            let mainContainer = document.createElement("div");
            mainContainer.classList.add("contrastPuzzle");
            mainContainer.innerHTML = curSolution.sanitize();

            //Position the element randomly in the bottom 80% of the screen
            mainContainer.style.left =
                randomBetween(100, window.innerWidth - 100) + "px";
            mainContainer.style.top =
                randomBetween(
                    0.2 * window.innerHeight,
                    window.innerHeight - 100
                ) + "px";

            //Add the container to the page
            document.body.appendChild(mainContainer);

            removeOnNextPuzzle = mainContainer;

            doAlways();
            break;

        case "6":
            //SPECTROGRAM

            mainText.innerHTML = "Audio puzzle 2";

            //I can't really make this randomized - making this puzzle was SO MUCH WORK
            curSolution = "b@23cn8";

            //Create the audio element we will be using
            let audioElement = new Audio(
                "https://github.com/Jacob-Guglielmin/legacy-tile-assets/blob/master/puzzle.mp3?raw=true"
            );

            //Create the container for the play and download buttons
            let buttonContainer = document.createElement("div");

            //Create the button to play the audio
            let playButton = document.createElement("button");
            playButton.innerHTML = "Play";
            playButton.onclick = () => {
                audioElement.currentTime = 0;
                audioElement.play();
            };

            //Create the button to download the audio
            let downloadButton = document.createElement("button");
            downloadButton.innerHTML = "Download Audio";
            downloadButton.onclick = () => {
                let audioLink = document.createElement("a");
                audioLink.href =
                    "https://github.com/Jacob-Guglielmin/legacy-tile-assets/blob/master/puzzle.mp3?raw=true";
                audioLink.download = "puzzle.mp3";
                audioLink.click();
            };

            //Add all the things to the page
            buttonContainer.appendChild(playButton);
            buttonContainer.appendChild(downloadButton);
            document.body.appendChild(buttonContainer);

            removeOnNextPuzzle = buttonContainer;

            doAlways();
            break;

        default:
            mainText.innerHTML =
                "Well, whatever you've just tried to do, it didn't work. It could be something on my end (sorry!). Try reloading the page.";
            hideElements(mainButton, mainInput);
            break;
    }
}

function doAlways() {
    document.body.style.overflowY = "hidden";

    mainButton.innerHTML = "Submit";
    mainButton.onclick = checkInput;

    showElements(mainInput, mainButton);

    if (puzzle != "3" && timePuzzle.updateHandler != undefined) {
        clearInterval(timePuzzle.updateHandler);
    }

    renderTickers();
    if (timeTrackingInterval == null) {
        timeTrackingInterval = setInterval(trackTime, 1000);
    }
}

function updateTimePuzzle() {
    let dateObj = new Date();

    //Check if the date has changed since the last check so we can reset the puzzle if need be
    let curDate = dateObj.toISOString().split("T")[0];
    if (curDate != timePuzzle.lastDate && timePuzzle.lastDate != undefined) {
        //Reset the solution
        curSolution = genRandomSequence(
            true,
            new Date().toLocaleString().split(",")[0] + device
        );

        timePuzzle.lastDate = curDate;
    } else if (timePuzzle.lastDate == undefined) {
        timePuzzle.lastDate = curDate;
    }

    //We want the first char at 8:30, the update every hour with all chars being removed at 3:30
    let curHour = dateObj.getHours();

    let isWeekend = dateObj.getDay() == 6 || dateObj.getDay() == 0;

    //Hours should "start" at XX:30
    if (dateObj.getMinutes() < 30) {
        curHour--;
    }

    curHour -= 8;

    //We now have a counter that is at 0 starting at 8:30 and increases by 1 every hour

    if (curHour < 0 || curHour > 6 || isWeekend) {
        //We are not inside the time interval - don't show anything at all
        timePuzzle.charElement.innerHTML = "";
    } else {
        //We are inside the time interval - show the correct character
        timePuzzle.charElement.innerHTML = curSolution[curHour].sanitize();
    }

    //Update mainText
    if (curHour < 0 || curHour > 6 || isWeekend) {
        mainText.innerHTML = "It is not currently within school hours.";
    } else if (curHour == 6) {
        mainText.innerHTML =
            "It's the last hour of the school day on " +
            new Date().toLocaleString("en-CA", {
                year: "numeric",
                month: "long",
                day: "numeric"
            }) +
            ".";
    } else {
        mainText.innerHTML =
            "It's the " +
            ["first", "second", "third", "fourth", "fifth", "sixth"][curHour] +
            " hour of the school day on " +
            new Date().toLocaleString("en-CA", {
                year: "numeric",
                month: "long",
                day: "numeric"
            }) +
            ". " +
            ["Six", "Five", "Four", "Three", "Two", "One"][curHour] +
            " " +
            (curHour == 5 ? "hour" : "hours") +
            " left!";
    }
}

function genRandomSequence(isValid, seed) {
    let seededRandom;
    if (seed != undefined) {
        seededRandom = new Math.seedrandom(seed);
    }

    let numberCount, letterCount, symbolCount;
    if (isValid) {
        numberCount = 3;
        letterCount = 3;
        symbolCount = 1;
    } else {
        // this is really lazy, but it works, ok? we also dont use this a lot, so i don't care
        while (
            numberCount + letterCount + symbolCount != 7 ||
            (numberCount == 3 && letterCount == 3 && symbolCount == 1)
        ) {
            numberCount = randomBetween(0, 4);
            letterCount = randomBetween(0, 4);
            symbolCount = randomBetween(0, 4);
        }
    }
    let sequence = "";
    for (let i = 0; i < numberCount; i++) {
        sequence += randomBetween(0, 9, seededRandom);
    }
    for (let i = 0; i < letterCount; i++) {
        sequence += "abcdefghijklmnopqrstuvwxyz"[
            randomBetween(0, 25, seededRandom)
        ];
    }
    for (let i = 0; i < symbolCount; i++) {
        sequence += "!@#$%^&*(+-=[};:/>?~"[randomBetween(0, 19, seededRandom)];
    }

    //Shuffle the sequence
    var a = sequence.split(""),
        n = sequence.length;

    for (let i = n - 1; i > 0; i--) {
        let j;
        if (seed == undefined) {
            j = Math.floor(Math.random() * (i + 1));
        } else {
            j = Math.floor(seededRandom() * (i + 1));
        }

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

function hideElements(...elements) {
    for (let element of elements) {
        element.classList.add("hidden");
    }
}

function showElements(...elements) {
    for (let element of elements) {
        element.classList.remove("hidden");
    }
}

let shakingTimeout = undefined;
function shake(element) {
    element.blur();
    element.classList.add("shaking");
    clearTimeout(shakingTimeout);
    shakingTimeout = setTimeout(() => {
        element.classList.remove("shaking");
    }, 500);
}

/**
 * Each tone is formatted as:
 *
 *  {
 *      pitch: HERTZ OF TONE
 *      time: TIME TO PLAY (SECONDS)
 *      volume: VOLUME (0-1)
 *  }
 *
 * Each tone will play sequentially, in order.
 */
function playTones(...tones) {
    let soundArr = [];
    for (let toneId = 0; toneId < tones.length; toneId++) {
        let tone = tones[toneId];
        let i;
        //Create a wave with the given pitch and volume for the given time
        for (i = 0; i < audio.context.sampleRate * tone.time; i++) {
            soundArr.push(
                Math.sin(
                    i / (audio.context.sampleRate / tone.pitch / (Math.PI * 2))
                ) * tone.volume
            );
        }

        //The rest here is to prevent weird audio artifacts created by each tone dropping to zero and then back to volume
        //Keep generating the wave until the value reaches about 0
        let prev =
            Math.sin(
                (i - 1) /
                    (audio.context.sampleRate / tone.pitch / (Math.PI * 2))
            ) * tone.volume;
        while (true) {
            //Get the next value
            let next =
                Math.sin(
                    i / (audio.context.sampleRate / tone.pitch / (Math.PI * 2))
                ) * tone.volume;

            //Check if the new value has just crossed into the positive range
            if (prev <= 0 && next >= 0) {
                //Sign changed - we are really close to 0

                //Make the last value whichever of the two is closer to 0
                if (Math.abs(next) < Math.abs(prev)) {
                    soundArr.push(next);
                }

                //The wave has hit 0 - stop
                break;
            } else {
                //Add this new value to the wave
                soundArr.push(next);
            }

            i++;
            prev = next;
        }
    }

    //Not sure how this works - got it off stack overflow
    let buf = new Float32Array(soundArr.length);
    for (let i = 0; i < soundArr.length; i++) {
        buf[i] = soundArr[i];
    }
    let buffer = audio.context.createBuffer(
        1,
        buf.length,
        audio.context.sampleRate
    );
    buffer.copyToChannel(buf, 0);

    //Cancel playing sounds
    if (audio.source) {
        audio.source.stop();
    }

    audio.source = audio.context.createBufferSource();
    audio.source.buffer = buffer;
    audio.source.connect(audio.context.destination);
    audio.source.start(0);
}

//Generate a random number between min and max (inclusive)
function randomBetween(min, max, seededFunction) {
    if (seededFunction == undefined) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        return Math.floor(seededFunction() * (max - min + 1)) + min;
    }
}

function shuffleArray(array) {
    let currentIndex = array.length,
        randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex]
        ];
    }

    return array;
}

//Time tracking
window.addEventListener("beforeunload", () => {
    //Save the time trackers
    localStorage.setItem("puzzleTimeElapsed", puzzleTimeElapsed);
    localStorage.setItem("globalTimeElapsed", globalTimeElapsed);
});
window.addEventListener("blur", () => {
    if (timeTrackingInterval != null) {
        clearInterval(timeTrackingInterval);
        timeTrackingInterval = null;
    }
});
window.addEventListener("focus", () => {
    if (
        puzzle != undefined &&
        puzzle != "INTRO" &&
        puzzle != "0" &&
        timeTrackingInterval == null
    ) {
        timeTrackingInterval = setInterval(trackTime, 1000);
    }
});
function trackTime() {
    puzzleTimeElapsed++;
    globalTimeElapsed++;

    renderTickers();
}
function renderTickers() {
    let puzzleHours = Math.floor(puzzleTimeElapsed / 3600);
    let puzzleMinutes = Math.floor((puzzleTimeElapsed % 3600) / 60);
    let puzzleSeconds = puzzleTimeElapsed % 60;
    let globalHours = Math.floor(globalTimeElapsed / 3600);
    let globalMinutes = Math.floor((globalTimeElapsed % 3600) / 60);
    let globalSeconds = globalTimeElapsed % 60;

    puzzleTicker.innerHTML =
        "Time elapsed (this puzzle): " +
        (puzzleHours < 10 ? "0" : "") +
        puzzleHours +
        ":" +
        (puzzleMinutes < 10 ? "0" : "") +
        puzzleMinutes +
        ":" +
        (puzzleSeconds < 10 ? "0" : "") +
        puzzleSeconds;
    globalTicker.innerHTML =
        "Time elapsed (all puzzles): " +
        (globalHours < 10 ? "0" : "") +
        globalHours +
        ":" +
        (globalMinutes < 10 ? "0" : "") +
        globalMinutes +
        ":" +
        (globalSeconds < 10 ? "0" : "") +
        globalSeconds;
}

String.prototype.sanitize = function () {
    var tagsToReplace = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    };
    return this.replace(/[&<>]/g, function (tag) {
        return tagsToReplace[tag] || tag;
    });
};

//Seeded random number generator, many thanks to David Bau
!(function (f, a, c) {
    var s,
        l = 256,
        p = "random",
        d = c.pow(l, 6),
        g = c.pow(2, 52),
        y = 2 * g,
        h = l - 1;
    function n(n, t, r) {
        function e() {
            for (var n = u.g(6), t = d, r = 0; n < g; )
                (n = (n + r) * l), (t *= l), (r = u.g(1));
            for (; y <= n; ) (n /= 2), (t /= 2), (r >>>= 1);
            return (n + r) / t;
        }
        var o = [],
            i = j(
                (function n(t, r) {
                    var e,
                        o = [],
                        i = typeof t;
                    if (r && "object" == i)
                        for (e in t)
                            try {
                                o.push(n(t[e], r - 1));
                            } catch (n) {}
                    return o.length ? o : "string" == i ? t : t + "\0";
                })(
                    (t = 1 == t ? { entropy: !0 } : t || {}).entropy
                        ? [n, S(a)]
                        : null == n
                        ? (function () {
                              try {
                                  var n;
                                  return (
                                      s && (n = s.randomBytes)
                                          ? (n = n(l))
                                          : ((n = new Uint8Array(l)),
                                            (
                                                f.crypto || f.msCrypto
                                            ).getRandomValues(n)),
                                      S(n)
                                  );
                              } catch (n) {
                                  var t = f.navigator,
                                      r = t && t.plugins;
                                  return [+new Date(), f, r, f.screen, S(a)];
                              }
                          })()
                        : n,
                    3
                ),
                o
            ),
            u = new m(o);
        return (
            (e.int32 = function () {
                return 0 | u.g(4);
            }),
            (e.quick = function () {
                return u.g(4) / 4294967296;
            }),
            (e.double = e),
            j(S(u.S), a),
            (
                t.pass ||
                r ||
                function (n, t, r, e) {
                    return (
                        e &&
                            (e.S && v(e, u),
                            (n.state = function () {
                                return v(u, {});
                            })),
                        r ? ((c[p] = n), t) : n
                    );
                }
            )(e, i, "global" in t ? t.global : this == c, t.state)
        );
    }
    function m(n) {
        var t,
            r = n.length,
            u = this,
            e = 0,
            o = (u.i = u.j = 0),
            i = (u.S = []);
        for (r || (n = [r++]); e < l; ) i[e] = e++;
        for (e = 0; e < l; e++)
            (i[e] = i[(o = h & (o + n[e % r] + (t = i[e])))]), (i[o] = t);
        (u.g = function (n) {
            for (var t, r = 0, e = u.i, o = u.j, i = u.S; n--; )
                (t = i[(e = h & (e + 1))]),
                    (r =
                        r * l +
                        i[h & ((i[e] = i[(o = h & (o + t))]) + (i[o] = t))]);
            return (u.i = e), (u.j = o), r;
        })(l);
    }
    function v(n, t) {
        return (t.i = n.i), (t.j = n.j), (t.S = n.S.slice()), t;
    }
    function j(n, t) {
        for (var r, e = n + "", o = 0; o < e.length; )
            t[h & o] = h & ((r ^= 19 * t[h & o]) + e.charCodeAt(o++));
        return S(t);
    }
    function S(n) {
        return String.fromCharCode.apply(0, n);
    }
    if ((j(c.random(), a), "object" == typeof module && module.exports)) {
        module.exports = n;
        try {
            s = require("crypto");
        } catch (n) {}
    } else
        "function" == typeof define && define.amd
            ? define(function () {
                  return n;
              })
            : (c["seed" + p] = n);
})("undefined" != typeof self ? self : this, [], Math);

init();
