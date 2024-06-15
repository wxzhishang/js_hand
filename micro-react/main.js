import { createElement, render, useState } from "./react"

const nodes = ["节点1", "节点2", "节点3"];


const list = createElement(
    "ul",
    null,
    ...nodes.map((node) => createElement("li", null, node))
);

const renderer = () => {
    const container = document.querySelector("#root");
    const element = createElement("h1", null, list);
    render(element, container);
};
renderer();
