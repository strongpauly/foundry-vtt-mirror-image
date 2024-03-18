const toggle = args[0];
if(toggle === "on") {
    await MirrorImage.on(token);
} else {
    await MirrorImage.off(token);
}