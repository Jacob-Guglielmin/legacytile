"use strict";

let times, globalTime, secretPuzzles;

const statsContainer = document.getElementById("statsContainer");

//Konami code
let konami = {
    correctSequence: "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba",
    currentSequence: [null, null, null, null, null, null, null, null, null, null],
    disabledKeys: []
};

function init() {
    times = localStorage.getItem("puzzleTimes");
    if (times != null) {
        times = JSON.parse(times);
    }

    globalTime = localStorage.getItem("globalTimeElapsed");
    if (globalTime != null) {
        globalTime = parseInt(globalTime);
    }

    secretPuzzles = localStorage.getItem("secretPuzzles");

    if (globalTime == null && secretPuzzles == null) {
        statsContainer.innerHTML = "There don't appear to be any stats to display yet. Try doing the puzzles first.";
        return;
    }

    if (globalTime != null) {
        statsContainer.innerHTML = "Total time elapsed: " + convertSeconds(globalTime);

        if (times != null && times.length > 0) {
            statsContainer.innerHTML += "<br>";
            for (let puzzle = 1; puzzle < times.length; puzzle++) {
                statsContainer.innerHTML += "<br>";

                if (times[puzzle] != null) {
                    statsContainer.innerHTML += "Puzzle " + puzzle + ": " + convertSeconds(times[puzzle]);
                } else {
                    statsContainer.innerHTML += "Puzzle " + puzzle + ": Not completed";
                }
            }
        }
    }

    if (secretPuzzles != null) {
        if (globalTime != null) {
            statsContainer.innerHTML += "<br><br>";
        }
        let secretPuzzlesCompleted = Object.keys(JSON.parse(secretPuzzles)).length;
        statsContainer.innerHTML += "Completed " + secretPuzzlesCompleted + " secret puzzle" + (secretPuzzlesCompleted > 1 ? "s" : "");
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

//Convert seconds to hh:mm:ss
function convertSeconds(seconds) {
    let hh = Math.floor(seconds / 3600);
    let mm = Math.floor((seconds - hh * 3600) / 60);
    let ss = seconds - hh * 3600 - mm * 60;

    if (hh < 10) {
        hh = "0" + hh;
    }

    if (mm < 10) {
        mm = "0" + mm;
    }

    if (ss < 10) {
        ss = "0" + ss;
    }

    return hh + ":" + mm + ":" + ss;
}

init();
