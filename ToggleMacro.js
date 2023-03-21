const [toggle] = args;
if(toggle === "on") {
    MirrorImage.on(token);
} else {
    MirrorImage.off(token);
}