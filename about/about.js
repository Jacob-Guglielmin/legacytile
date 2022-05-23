"use strict";

//Konami code
let konami = {
    correctSequence:
        "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba",
    currentSequence: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ],
    disabledKeys: []
};

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
