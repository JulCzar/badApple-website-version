(async function main() {
  const d = document;
  const w = window;

  const ROOT = d.getElementById('root');

  const buttonReplay = Object.assign(d.createElement('button'), {
    classList: 'button hidden',
    innerText: 'replay',
  });
  const canvas = Object.assign(d.createElement('canvas'), {
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const ctx = canvas.getContext('2d');
  ctx.font = '16px monospace';

  const FRAMERATE = 30;

  ROOT.appendChild(canvas);
  ROOT.appendChild(buttonReplay);

  const getDimensions = () => {
    let height = 0;
    let width = 0;
    let fontSize = 0;
    const observers = [];

    const notifyAll = () => {
      observers.forEach(o => o?.());
    };

    const dimensions = {
      get height() {
        return height;
      },
      get width() {
        return width;
      },
      set height(v) {
        height = v;
      },
      set width(v) {
        width = v;
      },
      get fontSize() {
        return fontSize;
      },
      set fontSize(v) {
        fontSize = v;
      },
      subscribe(observer) {
        observers.push(observer);

        function unsubscribe() {
          observers = observers.filter(o => o !== observer);
        }

        return unsubscribe;
      },
    };

    w.addEventListener(
      'resize',
      /** @param {Event} evt */ evt => {
        /** @type {EventTarget & Window} */ const target = evt.target;

        const maxW = target.innerHeight;
        const fw = target.innerWidth * (4 / maxW);
        const fpc = Math.round(((fw * 100) / 16) * 100) / 100;

        dimensions.width = target.innerWidth;
        dimensions.height = target.window.innerHeight;
        dimensions.fontSize = Math.min(16, fpc);

        notifyAll();
      }
    );

    return dimensions;
  };
  const dimensions = getDimensions();
  dimensions.subscribe(() => {
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    ctx.font = `${dimensions.fontSize}px monospace`;
  });

  /**
   * @param {number[][]} frame
   */
  function printFrame(frame) {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const heightForRatio = (width * 3) / 4;
    const widthForRatio = (height * 4) / 3;

    const widthIsTooLarge = widthForRatio > width;
    const heightIsTooLarge = heightForRatio > height;

    const [frameHeight, frameWidth] = [frame.length, frame[0].length];
    const [incrementX, incrementY] = [
      (widthIsTooLarge ? width : widthForRatio) / frameWidth,
      (heightIsTooLarge ? height : heightForRatio) / frameHeight,
    ];

    for (const [i, row] of Object.entries(frame)) {
      for (const [j, pixel] of Object.entries(row)) {
        const [posX, posY] = [j * incrementX, i * incrementY];
        if (pixel !== '⠄') ctx.fillText(
          pixel,
          posX + (widthIsTooLarge ? 0 : Math.abs(width - widthForRatio) / 2),
          posY +
          (heightIsTooLarge ? 16 : Math.abs(height - heightForRatio) / 2 + 16)
        );
      }
    }
  }

  function parseTime(ms) {
    return {
      minutes: Math.floor(ms / 60),
      seconds: Math.floor(ms % 60)
    }
  }

  function playVideo(array, startTime = Date.now()) {
    try {
      const now = Date.now();
      const currentFrameCount = Math.min(
        Math.round((now - startTime) / (1000 / FRAMERATE))
      );
      const currentTime = (now - startTime) / 1000;
      const { minutes, seconds } = parseTime(currentTime)

      d.title = `${minutes.toFixed(0).padStart(2, 0)}:${seconds.toFixed(0).padStart(2, 0)}`
      const currentFrame = array[currentFrameCount];

      printFrame(currentFrame);

      requestAnimationFrame(() => playVideo(array, startTime));
    } catch (e) {
      if (e instanceof Error) {
        if (!e.message.includes('length')) return console.error(e);
        d.title = 'BadApple'
        buttonReplay.classList.remove('hidden');
      } else {
        console.error(e);
      }
    }
  }

  const loadBadApple = async () => {
    const badApple = await fetch('/src/assets/badApple.zip').then(r =>
      r.blob()
    );
    const badAppleAB = await badApple.arrayBuffer();

    const zip = JSZip();

    const badAppleZip = await zip.loadAsync(badAppleAB);
    const badAppleStringified = await badAppleZip
      .file('badApple.json')
      .async('string');
    const badAppleJSON = JSON.parse(badAppleStringified);

    return badAppleJSON;
  };

  const badApple = await loadBadApple();

  playVideo(badApple.data);

  buttonReplay.addEventListener('click', () => {
    buttonReplay.classList.add('hidden');
    playVideo(badApple.data);
  });
})();
