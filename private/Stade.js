class Stade {
    constructor(data, vars) {
        this.VARS = vars;
        this.DATA = data;
        this.infos = {};
        this.POINTS = [];
        this.publicPoints = [];

        this.jury = 0;
        this.juryNext = false;
        this.public = 0;
        this.final = false;

        this.publicPoints = this.DATA.public_points;

        this.infos.jury_nb = this.DATA.jury_points.length;
        this.infos.countries_nb = this.DATA.countries.length;

        let moving = vars.MOVING_START;
        for (let i = 0; i < this.DATA.countries.length; i++) {
            const country = this.DATA.countries[i];
            const countryID = getID(country.name);
            $("#countries").append(`<div class="country" id="${countryID}">
                                        <img class="flag" src="${country.flag}">
                                        <h1 class="country-name">${country.name}</h1>
                                        <div class="country-added-points" id="${countryID}-added-points">10</div>
                                        <h1 class="country-points" id="${countryID}-points">0</h1>
                                    </div>`);
            $(`#${countryID}`).css("bottom", `${moving}px`)
            moving += vars.MOVING_IN;
            this.POINTS.push({id: countryID, points: 0});
        }
        this.POINTS.reverse();
    }

    addPoints(data) {
        const countryID = data.id;
        const points = data.points;

        let countryPointsIndex = getIndex(countryID, this.POINTS);
        this.POINTS[countryPointsIndex].points += points;
        let addedPointsElement = $(`#${countryID}-added-points`);
        addedPointsElement.text(points);
        addedPointsElement.css("opacity", 1);
        addedPointsElement.css("right", "150px");

        $(`#${countryID}-points`).text(this.POINTS[countryPointsIndex].points);

        if (data.update) {
            setTimeout(() => {
                const addedPointsElements = $(".country-added-points");
                for (let i = 0; i < addedPointsElements.length; i++) {
                    addedPointsElement = addedPointsElements[i];
                    if ($(addedPointsElement).css("right") == "150px") {
                        $(addedPointsElement).css("right", "-100px").delay(1000);
                        setTimeout(() => {
                            if (data.changeBG) {
                                setTimeout(() => {
                                    $(`#${countryID}`).css("background", "#D74703");
                                }, 500);
                            }
                        }, 250);
                    }
                }
            }, 2000);
        }
    }
    
    sort(final) {
        this.POINTS.sort((a, b) => {
            return b.points - a.points
        });
        let moving = this.VARS.MOVING_START;
        let sound = false;
        for (i = (this.POINTS.length - 1); i >= 0; i--) {
            const country = this.POINTS[i];
            if ($(`#${country.id}`).css("bottom") != `${moving}px`) sound = true;
            $(`#${country.id}`).css("bottom", `${moving}px`);
            if (final) $(`#${country.id}-place`).css("bottom", `${moving}px`);
            moving += this.VARS.MOVING_IN;
        }
        if (sound) playsound("./private/sounds/switch_position.mp3");
    }

    next() {
        // JURY
        if (this.jury < this.infos.jury_nb) {
            // NORMAL POINTS
            if (!this.juryNext) {
                console.log(`${this.DATA.jury_points[this.jury].name} calling...`);
                const points = this.DATA.jury_points[this.jury].points;
                points.reverse();
                const pointsToGive = [1, 2, 3, 4, 5, 6, 7, 8, 10];

                for (let i = 0; i < pointsToGive.length; i++) {
                    const pointToGive = pointsToGive[i];
                    this.addPoints({
                        id: points[i],
                        points: pointToGive,
                        update: false,
                        changeBG: false
                    });
                }
                setTimeout(() => this.sort(false), 1000);

                playsound("./private/sounds/got_points.mp3");

                this.juryNext = true;
                return;
            // 12 POINTS
            } else {
                const points = this.DATA.jury_points[this.jury].points;
                this.addPoints({
                    id: points[9],
                    points: 12,
                    update: true,
                    changeBG: false
                });
                setTimeout(() => this.sort(false), 1000);

                playsound("./private/sounds/got_points.mp3");

                this.POINTS.sort((a, b) => {
                    return a.points - b.points;
                });

                this.juryNext = false;
                this.jury ++;
                return;
            }
        }
        // PUBLIC
        if (this.public < this.infos.countries_nb) {
            if (this.public == 0) {
                this.FINAL_ORDER = JSON.parse(JSON.stringify(this.POINTS));
                this.FINAL_ORDER.reverse();
            }
            const countryID = this.FINAL_ORDER[this.public].id;
            const pointsToAddIndex = getIndex(countryID, this.publicPoints);
            const pointsToAdd = this.publicPoints[pointsToAddIndex].points;
            this.addPoints({
                id: countryID,
                points: pointsToAdd,
                update: true,
                changeBG: true
            });
            setTimeout(() => {
                this.sort(false)
                const countryPoints = this.POINTS[getIndex(countryID, this.POINTS)].points;
                if (countryPoints >= this.POINTS[0].points)
                        playsound("./private/sounds/new_leader.mp3");
            }, 1000);
            
            if (pointsToAdd <= this.VARS.LESS_POINTS_PLAYSOUND)
                playsound("./private/sounds/got_points_but_less.mp3");
            else
                playsound("./private/sounds/got_points.mp3");

            this.public ++;
            return;
        }
        // END
        if (this.final == null) return;
        // FINAL END
        else if (this.final) {
            for (i = 0; i < this.POINTS.length; i++) {
                const countryID = this.POINTS[i].id;
                const countryEl = $(`#${countryID}`);
                countryEl.css("opacity", 1);
                countryEl.css("transform", "translateX(25px)");
                $(`#${countryID}-place`).css("opacity", 1);
                $(`#${countryID}-place`).css("transform", "translateX(-250px)");
                $(`#${countryID}-place`).css("width", "50px")
            }
            $("#title").css("opacity", 1);

            this.final = null;
            return;
        // FINAL
        } else {
            for (i = 0; i < this.POINTS.length; i++) {
                const place = (i + 1);
                const countryID = this.POINTS[i].id;
                const countryEl = $(`#${countryID}`);
                countryEl.css("width", "450px");
                $(`<div class="place" id="${countryID}-place"><div class="place-number">${(place < 10 ? "0" : "") + place}</div></div>`).insertBefore(countryEl);
                countryEl.css("background", "linear-gradient(4deg, #1b1428 0%, #1b1428 40%, #6c2732 90%)");
                countryEl.css("opacity", 0);
            }
            this.sort(true);

            this.final = true;
            return;
        }
    }
}

function getID(name) {
    return name.toLowerCase().replace(" ", "-").replace(" ", "-");
}

function getIndex(id, table) {
    for (i = 0; i < table.length; i++) {
        if (table[i].id == id) return i;
    }
    return null;
}

function playsound(fileName) {
    var audio = new Audio(fileName);
    audio.loop = false;
    audio.play(); 
}

function sortByPoints(json) {
    
}