
var DATA = {};
var infos = {};
var POINTS = [];
var publicPoints = []

function getID(name) {
    return name.toLowerCase().replace(" ", "-");
}

$.getJSON("data.json", (data) => {
    DATA = data;
    publicPoints = data.public_points;

    infos.jury_nb = DATA.jury_points.length;
    infos.countries_nb = DATA.countries.length;

    let moving= -400;
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
        moving += 200;
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
    const countryPointsIndex = getIndex(id, POINTS);
    POINTS[countryPointsIndex].points += points;
    const addedPointsElement = $(`#${id}-added-points`);
    addedPointsElement.text(points);
    addedPointsElement.css("opacity", 1);
    setTimeout(() => {
        addedPointsElement.css("right", "-100px");
        setTimeout(() => {
            $(`#${id}-points`).text(POINTS[countryPointsIndex].points);
            setTimeout(sort, 500);
        }, 500);
    }, 2000);
}

function sort() {
    POINTS.sort((a, b) => {
        return b.points - a.points
    });
    let moving= -400;
    for (i = (POINTS.length - 1); i >= 0; i--) {
        const country = POINTS[i];
        $(`#${country.id}`).css("bottom", `${moving}px`);
        moving += 200;
    }
}

function next() {
    if (stade < infos.jury_nb) {
        console.log(`Stade jury (${stade})`);
    } else {
        const newStade = stade - infos.jury_nb;
        if (newStade >= infos.countries_nb) return;
        const countryID = getID(DATA.countries[newStade].name);
        const pointsToAddIndex = getIndex(countryID, publicPoints);
        const pointsToAdd = publicPoints[pointsToAddIndex].points;
        addPoints(countryID, pointsToAdd);
    }
    stade ++;
}

document.body.onkeyup = (e) => {
    if(e.key == " ") next();
};