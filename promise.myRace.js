/**
 * 为Promise对象添加一个myRace方法，该方法的功能是竞争解析或拒绝多个Promise中的第一个。
 * @param {Array} promises - 一个包含多个Promise对象的数组。
 * @returns {Promise} 返回一个新的Promise，该Promise将被第一个解决（resolve或reject）的Promise的结果所解决或拒绝。
 */
Promise.prototype.myRace = function (promises) {
    // 检查promises参数是否为数组
    if (!Array.isArray(promises)) {
        throw new Error("promises is not a array!")
    }

    let isResolved = false; // 标记是否已有Promise被解决或拒绝
    return new Promise((resolve, reject) => {
        // 遍历promises数组
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(data => {
                // 如果还没有Promise被解决或拒绝，则解决当前Promise
                if (!isResolved) {
                    isResolved = true;
                    resolve(data)
                }
            }).catch(err => {
                // 如果还没有Promise被解决或拒绝，则拒绝当前Promise
                if (!isResolved) {
                    isResolved = true;
                    reject(err)
                }
            })
        }
    })
}

// 测试样例1：正常解决
let promise1 = Promise.resolve('Promise 1');
let promise2 = new Promise((resolve, reject) => setTimeout(() => resolve('Promise 2'), 1000));
let promise3 = new Promise((resolve, reject) => setTimeout(() => resolve('Promise 3'), 500));

Promise.prototype.myRace([promise1, promise2, promise3]).then(result => {
    console.log('First resolved promise:', result);
}).catch(error => {
    console.error('Error:', error);
});

// 输出: First resolved promise: Promise 1

// 测试样例2：正常拒绝
let promise4 = Promise.reject('Error 1');
let promise5 = new Promise((resolve, reject) => setTimeout(() => resolve('Promise 5'), 1000));
let promise6 = new Promise((resolve, reject) => setTimeout(() => resolve('Promise 6'), 500));

Promise.prototype.myRace([promise4, promise5, promise6]).then(result => {
    console.log('First resolved promise:', result);
}).catch(error => {
    console.error('Error:', error);
});

// 输出: Error: Error 1

// 测试样例3：非数组参数
try {
    Promise.prototype.myRace('not an array');
} catch (error) {
    console.error(error.message);
}

// 输出: promises is not a array!

// 测试样例4：三个setTimeout
let promise7 = new Promise((resolve, reject) => setTimeout(() => resolve('Promise 7'), 1000));
let promise8 = new Promise((resolve, reject) => setTimeout(() => resolve('Promise 8'), 500));
let promise9 = new Promise((resolve, reject) => setTimeout(() => resolve('Promise 9'), 2000));

Promise.prototype.myRace([promise7, promise8, promise9]).then(result => {
    console.log('First resolved promise:', result);
}).catch(error => {
    console.error(error);
});

// 输出: First resolved promise: Promise 8