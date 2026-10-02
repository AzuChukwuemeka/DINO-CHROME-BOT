Dino Pixel Bot

A small JavaScript bot that plays the Chrome Dino game by reading the game's canvas and automatically jumping over cactus obstacles.

The fun project from twitter uses pixel detection and simple distance-based logic rather than accessing or modifying the game's internal state.

## Inspiration

The idea for this project came from an X post by **[@ifeebabyy](https://x.com/ifeebabyy)**.

## How It Works

The bot continuously reads the Dino game's canvas using `requestAnimationFrame()`.

The basic loop is:

```text
Canvas -> Read pixels -> Detect objects -> Detect Dino -> Detect closest cactus -> Measure distance -> Cactus close enough? -> Press Space
```

The bot does not use the game's internal JavaScript state.

### Main Components

* **Dino detection** — identifies the Dino from the canvas pixels.
* **Cactus detection** — finds objects in front of the Dino that resemble obstacles.
* **Distance detection** — calculates the distance between the Dino and the closest cactus.
* **Jump automation** — sends a Space key event when the cactus is close enough.
* **Game-over detection** — detects the game's `GAME OVER` screen and stops the bot until the game is restarted.

## Running It

1. Open the Dino game at:

   `https://chromedino.com/`

2. Open Chrome extensions:

   `chrome://extensions`

3. Enable **Developer mode**.

4. Select **Load unpacked**.

5. Select the project folder.

6. Start the Dino game.

The bot will automatically begin detecting the Dino and obstacles.

## Limitations

This is intentionally a simple pixel-based bot, so it has several limitations:

* It relies on the visual appearance and position of objects on the canvas.
* It does not understand the game's internal physics.
* Jump timing is based primarily on the distance to the closest cactus.
* The jump duration is fixed rather than dynamically controlling the height of each jump.
* Very closely spaced obstacles can still cause the bot to make imperfect jumps.
* Changes to the Dino game's graphics or canvas layout may break detection.
* Other obstacles, such as birds, are not handled with sophisticated decision-making.
* Pixel detection requires processing the canvas continuously, so performance can affect reaction timing.
* It is designed specifically around the current Dino game canvas and is not a general-purpose game-playing system.

The biggest lesson was that **more calculations do not necessarily make a real-time bot better**. Keeping the decision loop simple can be more effective when the game moves quickly.

## License

This project is for learning and experimentation.
