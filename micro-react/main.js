// //测试createElement.js
// import { createElement } from "./react";
// // 转换后
// const element2 = createElement("h1", {
//     title: "world"
// }, "Hello", createElement("div", null, "!"));

// console.log(element2);


//测试render.js
import { createElement, render } from "./react";

const element = createElement(
    "h1",
    {
        title: "world",
    },
    "Hello",
    createElement("div", null, '!')
);
const container = document.getElementById("root");
render(element, container);
