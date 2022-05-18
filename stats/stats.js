"use strict";

let times, globalTime;

const statsContainer = document.getElementById("statsContainer");

function init() {
    times = localStorage.getItem("puzzleTimes");
    if (times != null) {
        times = JSON.parse(times);
    }

    globalTime = localStorage.getItem("globalTimeElapsed");
    if (globalTime != null) {
        globalTime = parseInt(globalTime);
    }

    if (globalTime == null) {
        statsContainer.innerHTML =
            "There don't appear to be any stats to display yet. Try doing the puzzles first.";
    } else {
        statsContainer.innerHTML =
            "Total time elapsed: " + convertSeconds(globalTime);

        if (times != null) {
            statsContainer.innerHTML += "<br>";
            for (let puzzle = 1; puzzle < times.length; puzzle++) {
                statsContainer.innerHTML += "<br>";

                if (times[puzzle] != null) {
                    statsContainer.innerHTML +=
                        "Puzzle " +
                        puzzle +
                        ": " +
                        convertSeconds(times[puzzle]);
                } else {
                    statsContainer.innerHTML +=
                        "Puzzle " + puzzle + ": Not completed";
                }
            }
        }
    }
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
