/**
 * 防抖函数
 * 用于限制函数调用的频率，当函数调用过于频繁时，可以使用防抖函数来推迟函数的实际执行。
 * 
 * @param {Function} fn 要执行的函数
 * @param {number} wait 等待时间，单位为毫秒
 * @param {boolean} immediate 是否立即执行，默认为false。如果为true，则在第一次调用后立即执行，然后进入防抖模式。
 * @returns {Function} 返回一个包装后的函数，该函数具有防抖功能
 */
function debounce(fn, wait, immediate = false) {
    let timer = null;

    // 返回一个包装函数
    return function () {
        // 如果定时器存在，说明之前已经调用过，需要取消之前的定时器
        // 存在定时器 清空
        if (timer) {
            clearInterval(timer);
            timer = null;
        }

        // 如果设置了立即执行，并且之前没有定时器，那么立即执行函数
        // 立即执行
        if (immediate) {
            // 判断是否执行过  如果执行过 timer 不为空
            const flag = !timer;

            // 执行函数
            flag && fn.apply(this, arguments);

            // 设置定时器，在等待时间后清除定时器，以便可以再次调用函数
            // n 秒后清空定时器
            timer = setTimeout(() => {
                timer = null;
            }, wait);
        } else {
            // 直接设置定时器，在等待时间后执行函数
            timer = setTimeout(() => {
                fn.apply(this, arguments);
            }, wait);
        }
    };
}

//测试样例
// 定义一个简单的计数器函数
let counter = 0;
const incrementCounter = () => {
    counter++;
    console.log(`Counter: ${counter}`);
};

// 创建一个防抖版本的incrementCounter函数
const debouncedIncrementCounter = debounce(incrementCounter, 500);

// 连续快速调用debouncedIncrementCounter函数10次
for (let i = 0; i < 10; i++) {
    debouncedIncrementCounter();
}

// 在500ms之后，计数器应该只增加一次
setTimeout(() => {
    console.log('Expected output after 500ms: Counter should be 1');
}, 600);

//测试样例2
let immediateCounter = 0;
const incrementImmediateCounter = () => {
    immediateCounter++;
    console.log(`Immediate Counter: ${immediateCounter}`);
};

// 创建一个防抖版本的incrementImmediateCounter函数，设置immediate为true
const debouncedImmediateIncrementCounter = debounce(incrementImmediateCounter, 500, true);

// 调用debouncedImmediateIncrementCounter函数
debouncedImmediateIncrementCounter();

// 在500ms之后，计数器应该只增加一次
setTimeout(() => {
    debouncedImmediateIncrementCounter();
    console.log('Expected output after 500ms: Immediate Counter should be 2');
}, 600);

//测试样例3
let continuousCounter = 0;
const incrementContinuousCounter = () => {
    continuousCounter++;
    console.log(`Continuous Counter: ${continuousCounter}`);
};

// 创建一个防抖版本的incrementContinuousCounter函数
const debouncedContinuousIncrementCounter = debounce(incrementContinuousCounter, 500);

// 快速连续调用debouncedContinuousIncrementCounter函数10次
for (let i = 0; i < 10; i++) {
    debouncedContinuousIncrementCounter();
}

// 在500ms之后，计数器应该只增加一次
setTimeout(() => {
    console.log('Expected output after 500ms: Continuous Counter should be 1');
}, 600);

// 再次快速连续调用debouncedContinuousIncrementCounter函数10次
for (let i = 0; i < 10; i++) {
    debouncedContinuousIncrementCounter();
}

// 在另一个500ms之后，计数器应该再增加一次
setTimeout(() => {
    console.log('Expected output after another 500ms: Continuous Counter should be 2');
}, 1100);