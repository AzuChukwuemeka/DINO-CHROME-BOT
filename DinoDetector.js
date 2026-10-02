class DinoDetector {

    constructor(canvas) {

        this.canvas = canvas;

        this.context =
            canvas.getContext("2d", {
                willReadFrequently: true
            });

        this.scanTop = 40;

        this.scanBottom = Math.min(
                120,
                canvas.height
            );

        this.scanWidth = canvas.width;

        this.scanHeight = this.scanBottom - this.scanTop;

        this.totalPixels = this.scanWidth * this.scanHeight;

        this.binary = new Uint8Array(
                this.totalPixels
            );

        this.visited = new Uint8Array(
                this.totalPixels
            );

        this.queue = new Int32Array(
                this.totalPixels
            );
    }

    isDarkPixel(red, green, blue, alpha) {

        return (alpha > 0 && red < 150 && green < 150 && blue < 150);
    }

    buildPixelMask() {

        const imageData =
            this.context.getImageData(
                0,
                this.scanTop,
                this.scanWidth,
                this.scanHeight
            );

        const pixels = imageData.data;

        this.binary.fill(0);

        let pixelIndex = 0;

        for (
            let index = 0;
            index < pixels.length;
            index += 4
        ) {

            if (
                this.isDarkPixel(
                    pixels[index],
                    pixels[index + 1],
                    pixels[index + 2],
                    pixels[index + 3]
                )
            ) {

                this.binary[pixelIndex] = 1;
            }

            pixelIndex++;
        }
    }

    detectObjects() {

        this.buildPixelMask();

        this.visited.fill(0);

        const objects = [];

        for (
            let index = 0;
            index < this.totalPixels;
            index++
        ) {

            if (
                this.binary[index] === 0 ||
                this.visited[index] === 1
            ) {

                continue;
            }

            const object =
                this.detectConnectedObject(index);

            if (
                object.pixelCount >= 5
            ) {

                objects.push(object);
            }
        }

        return objects;
    }

    detectConnectedObject(
        startIndex
    ) {

        let queueStart = 0;
        let queueEnd = 0;

        this.queue[queueEnd++] =
            startIndex;

        this.visited[startIndex] = 1;

        let minX = this.scanWidth;

        let minY = this.scanHeight;

        let maxX = -1;
        let maxY = -1;

        let pixelCount = 0;

        while (queueStart < queueEnd) {
            const index = this.queue[queueStart++];
            const x = index % this.scanWidth;

            const localY = Math.floor(index / this.scanWidth);

            const actualY = localY + this.scanTop;

            pixelCount++;

            minX = Math.min(minX, x);

            maxX = Math.max(maxX, x);

            minY = Math.min(minY, actualY);

            maxY = Math.max(maxY, actualY);

            for (
                let offsetY = -1;
                offsetY <= 1;
                offsetY++
            ) {

                const nextY = localY + offsetY;

                if (nextY < 0 || nextY >= this.scanHeight) {
                    continue;
                }

                for (let offsetX = -1; offsetX <= 1; offsetX++) {

                    if (offsetX === 0 && offsetY === 0) {
                        continue;
                    }

                    const nextX = x + offsetX;
                    if (nextX < 0 || nextX >= this.scanWidth) {
                        continue;
                    }

                    const nextIndex =
                        nextY *
                        this.scanWidth +
                        nextX;

                    if (
                        this.binary[nextIndex] === 1 &&
                        this.visited[nextIndex] === 0
                    ) {

                        this.visited[nextIndex] = 1;

                        this.queue[queueEnd++] =
                            nextIndex;
                    }
                }
            }
        }

        return {
            minX,
            minY,
            maxX,
            maxY,

            width:
                maxX -
                minX +
                1,

            height:
                maxY -
                minY +
                1,

            pixelCount
        };
    }

    detectDino(objects) {

        let dino = null;

        for (const object of objects) {
            if (object.minX > this.canvas.width * 0.30) {
                continue;
            }

            if (object.maxY < 90) {
                continue;
            }

            if (object.height < 10) {
                continue;
            }

            if (!dino || object.minX < dino.minX) {
                dino = object;
            }
        }

        return dino;
    }

    detectCactusObstacles(
        objects,
        dino
    ) {

        if (!dino) {
            return [];
        }

        const cactuses = [];

        for (const object of objects) {
            if (object.minX <= dino.maxX) {
                continue;
            }

            if (object.minX > this.canvas.width * 0.95) {
                continue;
            }

            if (object.maxY < dino.minY) {
                continue;
            }

            cactuses.push(object);
        }

        cactuses.sort(
            (first, second) => first.minX - second.minX
        );

        return cactuses;
    }

    detectClosestCactus(
        cactuses
    ) {

        if (cactuses.length === 0) {
            return null;
        }

        return cactuses[0];
    }

    calculateCactusDistance(dino, cactus) {

        if (!dino || !cactus) {
            return null;
        }

        return (cactus.minX - dino.maxX);
    }

    detectGameOver() {

        const width = 191;
        const height = 15;

        const x = Math.round(
                this.canvas.width / 2 -
                width / 2
            );

        const y = Math.round(
                (this.canvas.height - 25) / 3
            );

        const pixels = this.context.getImageData(
                x,
                y,
                width,
                height
            ).data;

        let darkPixels = 0;

        for (
            let index = 0;
            index < pixels.length;
            index += 4
        ) {

            if (
                this.isDarkPixel(
                    pixels[index],
                    pixels[index + 1],
                    pixels[index + 2],
                    pixels[index + 3]
                )
            ) {

                darkPixels++;

                if (darkPixels > 20) {
                    return true;
                }
            }
        }

        return false;
    }

    detectGameState() {

        if (this.detectGameOver()) {
            return {
                gameOver: true,
                dino: null,
                cactus: null,
                cactuses: [],
                cactusDistance: null
            };
        }

        const objects = this.detectObjects();

        const dino = this.detectDino(objects);

        if (!dino) {

            return {
                gameOver: false,
                dino: null,
                cactus: null,
                cactuses: [],
                cactusDistance: null
            };
        }

        const cactuses = this.detectCactusObstacles(
                objects,
                dino
            );

        const cactus = this.detectClosestCactus(
                cactuses
            );

        return {
            gameOver: false,
            dino,
            cactus,
            cactuses,
            cactusDistance:
                this.calculateCactusDistance(
                    dino,
                    cactus
                )
        };
    }

    reset() {

        this.binary.fill(0);

        this.visited.fill(0);
    }
}

window.DinoDetector = DinoDetector;