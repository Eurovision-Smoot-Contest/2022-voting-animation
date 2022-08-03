
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

    let moving= -500;
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
    let countryPointsIndex = getIndex(id, POINTS);
    POINTS[countryPointsIndex].points += points;
    const addedPointsElement = $(`#${id}-added-points`);
    addedPointsElement.text(points);
    addedPointsElement.css("opacity", 1);
    addedPointsElement.css("right", "150px");
    setTimeout(() => {
        sort();
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

function sort() {
    POINTS.sort((a, b) => {
        return b.points - a.points
    });
    let moving= -500;
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
        if (newStade == infos.countries_nb) {
            let moving = -500;
            for (i = 0; i < POINTS.length; i++) {
                const place = (i + 1);
                const countryID = POINTS[i].id;
                const countryEl = $(`#${countryID}`);
                $(`<div class="place" id="${countryID}-place"><div class="place-number">0${place}</div></div>`).insertBefore(countryEl);
                $(`#${countryID}-place`).css("bottom", countryEl.css("bottom"));
                $(`#${countryID}-place`).css("transform", "translateX(-310px)");
                countryEl.css("background", "linear-gradient(4deg, #1b1428 0%, #1b1428 40%, #6c2732 90%)");
                countryEl.css("transform", "translateX(100px)");
                countryEl.css("width", "675px");
                moving += 200;
            }
            $(`<div id="title">Results of the Eurovision Smoot Contest 2022</div>`).insertBefore("#countries");
            stade ++;
            return;
        } else if (newStade > infos.countries_nb) return;
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