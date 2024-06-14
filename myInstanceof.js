/**
* 检查一个对象是否属于指定类型的实例。
* @param {Object} obj - 待检查的对象。
* @param {Function} type - 指定的类型（构造函数）。
* @returns {boolean} - 如果对象是该类型的实例则返回 true，否则返回 false。
*/
function myInstanceof(obj, type) {
    // 检查对象是否为 null 或非对象类型
    if (obj === null || typeof obj !== 'object') {
        return false;
    }

    // let objPrototype = obj.__proto__; // 获取对象的原型链起点
    let objPrototype = Object.getPrototypeOf(obj);

    // 遍历原型链，直至找到匹配的类型或到达原型链底部
    while (true) {
        if (!objPrototype) return false; // 如果原型为 null，表示到达原型链底部，返回 false
        if (objPrototype === type.prototype) {
            return true; // 当前原型等于指定类型的原型，表示找到匹配的类型，返回 true
        }
        objPrototype = Object.getPrototypeOf(objPrototype); // 继续向上遍历原型链
    }
}

//测试数据1
// 定义一个构造函数
function Animal(name) {
    this.name = name;
}

// 创建一个实例
const dog = new Animal("Dog");

// 测试 myInstanceof
console.log(myInstanceof(dog, Animal)); // 期望输出: true
console.log(dog instanceof Animal); // 确认对比，期望输出: true

//测试数据2
// 使用基本数据类型或无关对象
console.log(myInstanceof(5, Animal)); // 期望输出: false
console.log(myInstanceof({}, Array)); // 期望输出: false

//测试数据3
// 增加一个子类
function Dog(name, breed) {
    Animal.call(this, name);
    this.breed = breed;
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const myDog = new Dog("Buddy", "Golden Retriever");

// 测试多级继承
console.log(myInstanceof(myDog, Animal)); // 期望输出: true
console.log(myInstanceof(myDog, Dog)); // 期望输出: true
console.log(myInstanceof(myDog, Object)); // 期望输出: true，因为所有对象最终都继承自Object

//测试数据4
console.log(myInstanceof(null, Object)); // 期望输出: false
try {
    console.log(myInstanceof(undefined, Object)); // 应当妥善处理，可能抛出错误或返回false
} catch (e) {
    console.error("处理未定义对象时出错");
}

//测试样例5
// 构造函数原型指向自身，形成循环
function StrangeType() { }
StrangeType.prototype.parent = StrangeType.prototype;

const strangeObj = new StrangeType();
console.log(myInstanceof(strangeObj, StrangeType)); // 期望输出: true，需确保能正确处理循环引用