const [toggle] = args;
if(toggle === "on") {
    await MirrorImage.on(token);
} else {
    await MirrorImage.off(token);
}