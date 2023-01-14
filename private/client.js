
const socket = io();

socket.on("data", (data) => {
    const stade = new Stade(data, {
        VOTE_MOVING_START: -800,
        VOTE_MOVING_IN: 160,
        FINAL_MOVING_START: -850,
        FINAL_MOVING_IN: 150,
        LESS_POINTS_PLAYSOUND: data.lessPointsPlaysound
    });

    document.body.onkeyup = (e) => {
        if(e.key == " ") stade.next();
    };
});