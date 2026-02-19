const lattice = document.querySelector("#lattice").getContext("2d");
const movesLabel = document.querySelector("#moves");
const restartButton = document.querySelector("#restart");

const camera = { x: window.innerWidth / 2, y: window.innerHeight / 2, width: null, height: null };
let zoom = 50;

let cameraDragStart = { x: 0, y: 0 };
let mouseStart = { x: 0, y: 0 };
let mouseHeld = false;

const bacteriaPath = new Path2D("m -2.218522,-122.78034 a 13.88138,13.88138 0 0 0 -13.881324,13.88131 13.88138,13.88138 0 0 0 9.144898,13.048072 v 9.118938 a 43.792755,43.792755 0 0 0 -29.712913,16.497847 l -5.638011,-7.095968 a 13.88138,13.88138 0 0 0 -0.956972,-15.904282 13.88138,13.88138 0 0 0 -19.50375,-2.234094 13.88138,13.88138 0 0 0 -2.23323,19.503751 13.88138,13.88138 0 0 0 15.276108,4.527888 l 7.784713,9.79817 a 43.792755,43.792755 0 0 0 -4.072763,18.44294 v 28.31292 h -8.774569 a 13.88138,13.88138 0 0 0 -13.048068,-9.14403 13.88138,13.88138 0 0 0 -13.881315,13.88131 13.88138,13.88138 0 0 0 13.881315,13.8813095 13.88138,13.88138 0 0 0 13.048068,-9.1449 h 8.774569 V 44.389821 l -6.38127,1.70975 a 13.88138,13.88138 0 0 0 -14.969802,-5.45545 13.88138,13.88138 0 0 0 -9.815473,17.00143 13.88138,13.88138 0 0 0 17.000565,9.81547 13.88138,13.88138 0 0 0 10.236851,-12.2105 l 4.97782,-1.33336 a 43.792755,43.792755 0 0 0 38.007255,34.00804 v 7.92576 a 13.88138,13.88138 0 0 0 -9.144026,13.048069 13.88138,13.88138 0 0 0 13.881324,13.88131 13.88138,13.88138 0 0 0 13.88133,-13.88131 13.88138,13.88138 0 0 0 -9.14489,-13.048068 v -7.92576 a 43.792755,43.792755 0 0 0 29.86087,-16.6882 l 2.85795,2.85795 a 13.88138,13.88138 0 0 0 2.76016,15.69142 13.88138,13.88138 0 0 0 19.63181,0 13.88138,13.88138 0 0 0 0,-19.630931 13.88138,13.88138 0 0 0 -15.69316,-2.760179 l -4.4751,-4.47511 a 43.792755,43.792755 0 0 0 4.11342,-18.53033 43.792755,43.792755 0 0 0 0,-0.0295 v -34.29011 h 13.21248 a 13.88138,13.88138 0 0 0 13.04805,9.144021 13.88138,13.88138 0 0 0 13.88132,-13.8813105 13.88138,13.88138 0 0 0 -13.88132,-13.88131 13.88138,13.88138 0 0 0 -13.04805,9.14489 H 41.573868 V -43.167268 a 43.792755,43.792755 0 0 0 0,-0.0285 43.792755,43.792755 0 0 0 -2.36993,-14.210978 l 9.86825,-5.697711 a 13.88138,13.88138 0 0 0 15.87227,1.394787 13.88138,13.88138 0 0 0 5.08078,-18.962095 13.88138,13.88138 0 0 0 -18.96211,-5.080786 13.88138,13.88138 0 0 0 -6.72736,14.443728 l -9.1743,5.297101 A 43.792755,43.792755 0 0 0 2.518778,-86.73202 v -9.118938 a 13.88138,13.88138 0 0 0 9.14403,-13.048072 13.88138,13.88138 0 0 0 -13.88133,-13.88131 z");
let bacteria = [{x: 0, y: 3, color: {r: 0, g: 200, b: 100}}];

let moveCount = 0;

let tweens = [];

restartButton.onclick = () => {
    bacteria = [{ x: 0, y: 3, color: { r: 0, g: 200, b: 100 } }];
    tweens = [];
    moveCount = 0;
    movesLabel.innerText = "Moves: 0";
}

function resize() {
    camera.width = window.innerWidth;
    camera.height = window.innerHeight
    lattice.canvas.width = camera.width;
    lattice.canvas.height = camera.height;
    draw();
}

function draw() {
    lattice.fillStyle = "black";
    lattice.strokeStyle = "#aaaaaa";
    lattice.lineWidth = 1;
    lattice.fillRect(0, 0, camera.width, camera.height);
    for (let x = 0.5 + camera.x % zoom; x < camera.width; x += zoom) {
        lattice.beginPath();
        lattice.moveTo(x, 0);
        lattice.lineTo(x, camera.height);
        lattice.stroke();
    }
    for (let y = 0.5 + camera.y % zoom; y < camera.height; y += zoom) {
        lattice.beginPath();
        lattice.moveTo(0, y);
        lattice.lineTo(camera.width, y);
        lattice.stroke();
    }

    lattice.strokeStyle = "yellow";
    lattice.strokeRect(0.5 + camera.x, 0.5 + camera.y, zoom * 3, zoom * 3);

    lattice.strokeStyle = "white";
    lattice.lineWidth = 20;
    
    for (const bact of bacteria) {
        lattice.save();
        lattice.translate(bact.x * zoom + camera.x, bact.y * zoom + camera.y);
        lattice.scale(zoom / 300, zoom / 300);
        lattice.rotate(coordHash(bact.x, bact.y) % (Math.PI * 2));

        lattice.fillStyle = `rgb(${bact.color.r}, ${bact.color.g}, ${bact.color.b})`;
        lattice.stroke(bacteriaPath);
        lattice.fill(bacteriaPath);
        lattice.restore();
    }
}

function coordHash(x, y) {
    return x * 0.14 + y * 0.64;
}

function click(x, y) {
    let foundAt = -1;
    let foundRight= -1;
    let foundTop = -1;
    for (let i = 0; i < bacteria.length; i++) {
        const bact = bacteria[i];
        if (bact.x === x && bact.y === y) {
            foundAt = i;
        }
        if (bact.x === x + 1 && bact.y === y) {
            foundRight = i;
        }
        if (bact.y === y - 1 && bact.x === x) {
            foundTop = i;
        }
    }

    if (foundAt > -1) {
        if (foundRight === -1 && foundTop === -1) {
            moveCount++;
            movesLabel.innerText = `Moves: ${moveCount}`;

            bacteria.splice(foundAt, 1);
            bacteria.push({ x: x, y: y, color: {r: 0, g: 200, b: 100} });
            tweens.push({ bactId: bacteria.length - 1, from: { x: x, y: y }, to: { x: x + 1, y: y }, type: "position", duration: 150, bezier: [0, 0, 1, 1] });
            bacteria.push({ x: x, y: y, color: {r: 0, g: 200, b: 100} });
            tweens.push({ bactId: bacteria.length - 1, from: { x: x, y: y }, to: { x: x, y: y - 1 }, type: "position", duration: 150, bezier: [0, 0, 1, 1] });
        } else {
            if (foundRight > -1) {
                tweens.push({ bactId: foundRight, from: { r: 0, g: 200, b: 100 }, to: { r: 255, g: 0, b: 0 }, type: "color", duration: 300, bezier: [0, 1, 1, 0] });
                tweens.push({ bactId: foundRight, from: { x: x + 1, y: y }, to: { x: x + 1.3, y: y }, type: "position", duration: 300, bezier: [0, 1, 1, 0] });
            }
            if (foundTop > -1) {
                tweens.push({ bactId: foundTop, from: { r: 0, g: 200, b: 100 }, to: { r: 255, g: 0, b: 0 }, type: "color", duration: 300, bezier: [0, 1, 1, 0] });
                tweens.push({ bactId: foundTop, from: { x: x, y: y - 1 }, to: { x: x, y: y - 1.3 }, type: "position", duration: 300, bezier: [0, 1, 1, 0] });
            }
        }
    }

    draw();
}

function processTweens(timestamp) {
    const newTweens = [];

    for (const tween of tweens) {
        if (tween.startTime === undefined) {
            tween.startTime = timestamp;
        }
        let t = (timestamp - tween.startTime) / tween.duration;

        if (t > 1) {
            t = 1;
        } else {
            newTweens.push(tween);
        }

        const bact = bacteria[tween.bactId];

        t = bezier(t, ...tween.bezier);

        if (tween.type === "position") {
            bact.x = (1 - t) * tween.from.x + t * tween.to.x;
            bact.y = (1 - t) * tween.from.y + t * tween.to.y;
        } else if (tween.type === "color") {
            bact.color.r = Math.trunc((1 - t) * tween.from.r + t * tween.to.r);
            bact.color.g = Math.trunc((1 - t) * tween.from.g + t * tween.to.g);
            bact.color.b = Math.trunc((1 - t) * tween.from.b + t * tween.to.b);
        }
    }

    tweens = newTweens;

    draw();
    window.requestAnimationFrame(processTweens);
}

function bezier(t, p0, p1, p2, p3) {
    return p0 * (1 - t) * (1 - t) * (1 - t) + p1 * 3 * (1 - t) * (1 - t) * t + p2 * 3 * (1 - t) * t * t + p3 * t * t * t;
}

window.requestAnimationFrame(processTweens);

window.addEventListener("resize", resize);

document.body.addEventListener("mousedown", (event) => {
    mouseHeld = true
    mouseStart.x = event.clientX;
    mouseStart.y = event.clientY;
    cameraDragStart.x = camera.x;
    cameraDragStart.y = camera.y;
});
document.body.addEventListener("mouseup", () => mouseHeld = false);
document.body.addEventListener("mousemove", (event) => {
    if (!mouseHeld) {
        return;
    }
    
    camera.x = cameraDragStart.x + event.clientX - mouseStart.x;
    camera.y = cameraDragStart.y + event.clientY - mouseStart.y;

    draw();
});
document.body.addEventListener("wheel", (event) => {
    const zoomWas = zoom;
    zoom = Math.round(Math.E ** Math.log(zoom - event.deltaY / 10));
    if (zoom < 20) {
        zoom = 20;
    } else if (zoom > 100) {
        zoom = 100;
    }

    const dx = (event.clientX - camera.x) * (zoom / zoomWas - 1);
    const dy = (event.clientY - camera.y) * (zoom / zoomWas - 1);

    camera.x -= dx;
    camera.y -= dy;

    console.log(zoom);
    event.preventDefault();
});
document.body.addEventListener("click", (event) => {
    if (tweens.length > 0) {
        return;
    }
    const gridX = Math.round((event.clientX - camera.x) / zoom);
    const gridY = Math.round((event.clientY - camera.y) / zoom);
    click(gridX, gridY);
});

resize();
