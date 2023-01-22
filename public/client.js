
const socket = io();

socket.on("step", (step) => {
    if (step.type == "text") {
        $("#title").text(step.title);
        $("#message-fr").text(step.message_fr);
        $("#message-en").text(step.message_en);
    } else
        document.location.href = step.redirect;
});
