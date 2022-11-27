
var DATA = {};
var infos = {};
var POINTS = [];
var publicPoints = []

var VOTE_MOVING_START = -800;
var VOTE_MOVING_IN = 160;

var FINAL_MOVING_START = -850;
var FINAL_MOVING_IN = 150;

var MIN_POINTS_PLAYSOUND = 6;

function getID(name) {
    return name.toLowerCase().replace(" ", "-").replace(" ", "-");
}

$.getJSON("data.json", (data) => {
    DATA = data;
    publicPoints = data.public_points;

    infos.jury_nb = DATA.jury_points.length;
    infos.countries_nb = DATA.countries.length;

    let moving= VOTE_MOVING_START;
    for (i = 0; i < data.countries.length; i++) {
        const country = data.countries[i];
        const countryID = getID(country.name);
        $("#countries").append(`<div class="country" id="${countryID}">
                                    <img class="flag" src="${country.flag}">
                                    <h1 class="country-name">${country.name}</h1>
                                    <div class="country-added-points" id="${countryID}-added-points">10</div>
                                    <h1 class="country-points" id="${countryID}-points">0</h1>
                                </div>`);
        $(`#${countryID}`).css("bottom", `${moving}px`)
        moving += VOTE_MOVING_IN;
        POINTS.push({id: countryID, points: 0});
    }
    POINTS.reverse();
});

let stade = 0;

function getIndex(id, table) {
    for (i = 0; i < table.length; i++) {
        if (table[i].id == id) return i;
    }
    return null;
}

function addPoints(id, points) {
    let countryPointsIndex = getIndex(id, POINTS);
    POINTS[countryPointsIndex].points += points;
    const addedPointsElement = $(`#${id}-added-points`);
    addedPointsElement.text(points);
    addedPointsElement.css("opacity", 1);
    addedPointsElement.css("right", "150px");
    setTimeout(() => {
        sort(false);
        setTimeout(() => {
            addedPointsElement.css("right", "-100px").delay(1000);
            setTimeout(() => {
                countryPointsIndex = getIndex(id, POINTS);
                $(`#${id}-points`).text(POINTS[countryPointsIndex].points);
                setTimeout(() => {
                    $(`#${id}`).css("background", "#D74703");
                }, 1000);
            }, 250);
        }, 2000);
    }, 3000);
}

function sort(final) {
    POINTS.sort((a, b) => {
        return b.points - a.points
    });
    let moving = final ? FINAL_MOVING_START : VOTE_MOVING_START;
    for (i = (POINTS.length - 1); i >= 0; i--) {
        const country = POINTS[i];
        $(`#${country.id}`).css("bottom", `${moving}px`);
        if (final) $(`#${country.id}-place`).css("bottom", `${moving}px`);
        moving += final ? FINAL_MOVING_IN : VOTE_MOVING_IN;
    }
}

function next() {
    if (stade < infos.jury_nb) {
        console.log(`Stade jury (${stade})`);
    } else {
        const newStade = stade - infos.jury_nb;
        if (newStade == infos.countries_nb) {
            for (i = 0; i < POINTS.length; i++) {
                const place = (i + 1);
                const countryID = POINTS[i].id;
                const countryEl = $(`#${countryID}`);
                countryEl.css("width", "450px");
                $(`<div class="place" id="${countryID}-place"><div class="place-number">${(place < 10 ? "0" : "") + place}</div></div>`).insertBefore(countryEl);
                countryEl.css("background", "linear-gradient(4deg, #1b1428 0%, #1b1428 40%, #6c2732 90%)");
                countryEl.css("opacity", 0);
            }
            sort(true);
            $(`<div id="title">Results of the Eurovision Smoot Contest 2022</div>`).insertBefore("#countries");
            stade ++;
            return;
        } else if ((newStade - 1) == infos.countries_nb) {
            for (i = 0; i < POINTS.length; i++) {
                const countryID = POINTS[i].id;
                const countryEl = $(`#${countryID}`);
                countryEl.css("opacity", 1);
                countryEl.css("transform", "translateX(25px)");
                $(`#${countryID}-place`).css("opacity", 1);
                $(`#${countryID}-place`).css("transform", "translateX(-250px)");
                $(`#${countryID}-place`).css("width", "50px")
            }
            $("#title").css("opacity", 1);
            return;
        } else if (newStade > infos.countries_nb) return;
        const countryID = getID(DATA.countries[newStade].name);
        const pointsToAddIndex = getIndex(countryID, publicPoints);
        const pointsToAdd = publicPoints[pointsToAddIndex].points;
        addPoints(countryID, pointsToAdd);
        if (pointsToAdd >= MIN_POINTS_PLAYSOUND && (newStade + 1) != infos.countries_nb) playsound("./sounds/score_over_100_points.mp3");
    }
    stade ++;
}

document.body.onkeyup = (e) => {
    if(e.key == " ") next();
};

function playsound(fileName) {
    var audio = new Audio(fileName);
    audio.loop = false;
    audio.play(); 
}