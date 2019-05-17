(function () {
    let config = { //默认的全局配置项
        rows: 3,
        cols: 3,
        width: 500,
        height: 500,
        backgroundImage: './img/1.jpg',
    };

    let computed = { //全局计算属性
        blockWidth: config.width / config.cols,
        blockHeight: config.height / config.rows,
        total: config.rows * config.cols,
        emptyBlock: {},
        count: 0,
        squareSet: []
    };

    function GameBoard(el, obj) {
        return new GameBoard.prototype.init(el, obj)
    }

    GameBoard.prototype = {

        /**
         * 生成游戏界面，初始化游戏
         * @param el 渲染的dom
         * @param obj 传入的配置
         */
        init: function (el, obj) {
            this.el = $(el);
            obj && this.changeConfig(obj);
            this.initBoard();
            //预留一个小方块在尾部，做调换位置的空白dom
            let oldPositions = this.correctPosition();
            this.shuffle(oldPositions);
            let correctPositions = this.correctPosition();
            for (let i = 0; i < computed.total; i++) {
                i < computed.total - 1 ? this.createBlock(oldPositions[i].x, oldPositions[i].y, true, correctPositions[i].x, correctPositions[i].y) : this.createBlock(oldPositions[i].x, oldPositions[i].y, false, correctPositions[i].x, correctPositions[i].y);
            }
        },

        /**
         * 改变公共配置项，更新计算属性
         * @param obj 传入的配置
         */
        changeConfig: function (obj) {
            config.rows = obj.rows || config.rows;
            config.cols = config.rows;
            config.width = obj.width || config.width;
            config.height = config.width;
            computed.blockWidth = config.width / config.cols;
            computed.blockHeight = config.height / config.rows;
            computed.total = config.rows * config.cols;
            config.backgroundImage = obj.url || config.backgroundImage;
        },

        /**
         * 打乱前八张图片的位置，最后一张不动，因为最后一张是用来移动的
         * @param arr 需要打乱的数组
         */
        shuffle: function (arr) {
            for (let i = 0; i < config.rows - 1; i++) {
                for (let j = 0; j < config.cols - 1; j++) {
                    let curEle = arr[i];
                    let randomIndex = this.getRandomIndex(0, arr.length - 1);
                    arr[i] = arr[randomIndex];
                    arr[randomIndex] = curEle;
                }
            }
        },

        /**
         * 打乱索引
         * @param min
         * @param max
         * @returns {number}
         */
        getRandomIndex: function (min, max) {
            let delta = max - min;
            return Math.floor(Math.random() * delta + min)
        },

        /**
         * 每个图片的正确位置
         * @returns {Array}
         */
        correctPosition: function () {
            let arr = [];
            for (let i = 0; i < config.rows; i++) {
                for (let j = 0; j < config.cols; j++) {
                    arr.push({
                        x: computed.blockWidth * i,
                        y: computed.blockHeight * j,
                    })
                }
            }
            return arr;
        },

        /**
         * 生成8小方块
         * 要随机取位置放置小方块
         * @param x 随机的x
         * @param y 随机的y
         * @param isRender 是否渲染该div
         * @param correctX 该div正确的x
         * @param correctY 该div正确的y
         */
        createBlock: function (x, y, isRender, correctX, correctY) {
            let div = $('<div>');
            div.css({
                width: computed.blockWidth,
                height: computed.blockHeight,
                position: 'absolute',
                left: x,
                top: y,
                border: '1px solid #fff',
                boxSizing: 'border-box',
                background: `url(${config.backgroundImage}) no-repeat`,
                backgroundPosition: `-${correctX}px -${correctY}px`,
                cursor: 'pointer',
                transition: 'all .3s ease-in-out'
            });
            div.correctX = correctX;
            div.correctY = correctY;
            div.on('click', () => {
                //判断相邻，点击的方块的left-空白方块的left的绝对值===一个小方块的高度或宽度
                let disX = Math.abs(parseFloat(div.css('left')) - parseFloat(computed.emptyBlock.css('left')));
                disX = parseInt(disX + '');
                let disY = Math.abs(parseFloat(div.css('top')) - parseFloat(computed.emptyBlock.css('top')));
                disY = parseInt(disY + '');
                if (disY + disX !== parseInt(computed.blockHeight) && disX + disY !== parseInt(computed.blockWidth)) {
                    return;
                }
                //交换点击的小方块和emptyBlock的位置，并判断游戏是否结束
                let x = div.css('left');
                let y = div.css('top');
                div.css({
                    left: computed.emptyBlock.css('left'),
                    top: computed.emptyBlock.css('top'),
                });
                computed.emptyBlock.css({
                    left: x,
                    top: y,
                });
                computed.count++;
                if (this.isWin()) { //所有的方块都走到了该走的位置
                    setTimeout(function () {
                        alert('游戏完成，共花费了' + computed.count + '次')
                    }, 300)
                }
            });
            computed.squareSet.push(div);
            if (isRender) {
                div.appendTo(this.el);
            } else {
                computed.emptyBlock = div;
            }
        },

        /**
         * 游戏结束的判断
         * @returns {boolean}
         */
        isWin: function () {
            let len = this.el.children().length, flag, count = 0;
            //每个div上面的的left和top都分别等于其correctX和correctY时游戏才结束
            let arr = [];
            for (let i = 0; i < len; i++) {
                const dom = this.el.find('div').eq(i);
                const squareSet = computed.squareSet[i];
                //用一个数组来存储，所有位置是否与其正确位置相等，由于最后一个移动之后值是原来的值，必定存在一个false,所以true的个数是len-1个
                arr.push(parseInt(dom.css('left')) === parseInt(squareSet.correctX) &&
                    parseInt(dom.css('top')) === parseInt(squareSet.correctY));
            }
            for (let key in arr) {
                if (arr[key]) {
                    count++;
                }
            }
            flag = count === arr.length - 1;
            return flag;
        },

        /**
         * 初始化el
         */
        initBoard: function () {
            this.el.css({
                width: config.width,
                height: config.height,
                position: 'absolute',
                border: "2px solid #ccc",
            });
            let div = $('<div>');
            div.css({
                width: config.width,
                height: config.height,
                position: 'absolute',
                border: "2px solid #ccc",
                left: config.width,
                backgroundImage: `url(${config.backgroundImage})`
            });
            $('body').append(div).find('div').css({
                display: 'inline-block',
            })
        }
    };
    GameBoard.prototype.init.prototype = GameBoard.prototype;
    window.Puzzle = GameBoard;
})();