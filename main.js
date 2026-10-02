const canvas = document.querySelector("canvas");

if (!canvas) {
    console.log("Dino canvas not found.");
} else {
    const dinoDetector = new DinoDetector(canvas);

    const CACTUS_JUMP_DISTANCE = 45;

    const JUMP_HOLD = 8;

    const JUMP_COOLDOWN = 100;

    let gameActive = false;

    let lastJumpTime = 0;

    let lastJumpedCactusX = null;

    let spaceIsHeld = false;

    let spaceReleaseTimer = null;


    function pressJumpKey() {

        if (spaceIsHeld) {
            return;
        }

        spaceIsHeld = true;

        document.dispatchEvent(new KeyboardEvent(
                "keydown",
                {
                    key: " ",
                    code: "Space",
                    keyCode: 32,
                    which: 32,
                    bubbles: true
                }
            )
        );

        spaceReleaseTimer =
            setTimeout(() => {
                    document.dispatchEvent(
                        new KeyboardEvent(
                            "keyup",
                            {
                                key: " ",
                                code: "Space",
                                keyCode: 32,
                                which: 32,
                                bubbles: true
                            }
                        )
                    );

                    spaceIsHeld = false;

                    spaceReleaseTimer = null;

                },
                JUMP_HOLD
            );
    }


    function isNewCactus(cactus) {

        if (lastJumpedCactusX === null) {
            return true;
        }

        return (Math.abs(cactus.minX - lastJumpedCactusX) > 20);
    }


    function resetController() {

        gameActive = false;

        lastJumpTime = 0;

        lastJumpedCactusX = null;

        spaceIsHeld = false;

        if (spaceReleaseTimer !== null) {
            clearTimeout(spaceReleaseTimer);
            spaceReleaseTimer = null;
        }

        dinoDetector.reset();
    }


    function triggerCactusJump(
        gameState,
        currentTime
    ) {

        pressJumpKey();

        lastJumpTime = currentTime;

        lastJumpedCactusX = gameState.cactus.minX;
    }


    function detectGame() {

        const gameState = dinoDetector.detectGameState();


        if (gameState.gameOver) {

            resetController();
            requestAnimationFrame(detectGame);
            return;
        }

        if (gameState.dino && !gameActive) {

            gameActive = true;

            lastJumpTime = performance.now();

            lastJumpedCactusX = null;

            console.log("Dino bot active.");
        }


        if (!gameState.dino || !gameState.cactus) {
            requestAnimationFrame(detectGame);
            return;
        }


        const currentTime = performance.now();


        const cooldownPassed = currentTime - lastJumpTime >= JUMP_COOLDOWN;

        const newCactus = isNewCactus(gameState.cactus);


        if (
            gameState.cactusDistance <=
            CACTUS_JUMP_DISTANCE &&
            cooldownPassed &&
            newCactus &&
            !spaceIsHeld
        ) {

            triggerCactusJump(gameState, currentTime);
        }


        requestAnimationFrame(detectGame);
    }


    console.log("Dino bot started.");

    requestAnimationFrame(detectGame);
}