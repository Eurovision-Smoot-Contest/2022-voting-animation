
const socket = io();

socket.on("data", (data) => {
    const stade = new Stade(data, {
        MOVING_START: -800,
        MOVING_IN: 160,
        LESS_POINTS_PLAYSOUND: data.lessPointsPlaysound
    });

    document.body.onkeyup = (e) => {
        if(e.key == " ") stade.next();
    };
});