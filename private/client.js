
const socket = io();

socket.on("data", (data) => {
    const stade = new Stade(data, {
        VOTE_MOVING_START: -800,
        VOTE_MOVING_IN: 160,
        FINAL_MOVING_START: -850,
        FINAL_MOVING_IN: 150,
        MIN_POINTS_PLAYSOUND: 100
    });

    document.body.onkeyup = (e) => {
        if(e.key == " ") stade.next();
    };
});