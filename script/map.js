/* TSUNAGARI Map */
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// 仮データ
const elements = [
    { "id": "a", "name": "a", "image": "/temp/ed9d4233a75aea4b33cc6b1b10bbdfc2.png", "type": "rect" },
    { "id": "b", "name": "b", "image": "/temp/60b65390-4495-406a-9b96-88e8fad733f0.jpeg", "type": "circle" },
    { "id": "c", "name": "c", "image": "/temp/60b65390-4495-406a-9b96-88e8fad733f0.jpeg", "type": "circle" },
    { "id": "d", "name": "d", "image": "/temp/e403IG00000270.jpg", "type": "rect" },
    { "id": "e", "name": "e", "image": "/temp/60b65390-4495-406a-9b96-88e8fad733f0.jpeg", "type": "circle" },
    { "id": "f", "name": "f", "image": "/temp/60b65390-4495-406a-9b96-88e8fad733f0.jpeg", "type": "circle" },
    { "id": "g", "name": "g", "image": "/temp/60b65390-4495-406a-9b96-88e8fad733f0.jpeg", "type": "circle" },
    { "id": "h", "name": "h", "image": null, "type": "rect" },
    { "id": "i", "name": "i", "image": "/temp/60b65390-4495-406a-9b96-88e8fad733f0.jpeg", "type": "rect" }
];

const connections = [
    { "from": "me", "to": "a" },
    { "from": "a", "to": "b" },
    { "from": "a", "to": "c" },
    { "from": "me", "to": "d" },
    { "from": "d", "to": "e" },
    { "from": "d", "to": "f" },
    { "from": "d", "to": "g" },
    { "from": "g", "to": "h" },
    { "from": "b", "to": "i" }
];

const me = {
    id: "me",
    name: "私",
    image: "/temp/f0cb2cfe-c842-457b-9141-88d81787f7a6.jpeg",
    type: "circle"
};

function convertData(elements, connections) {
    const nodes = elements.reduce((acc, element) => {
        acc[element.id] = { ...element, children: [] };
        return acc;
    }, {});

    nodes[me.id] = { ...me, children: [] };

    connections.forEach(({ from, to }) => {
        if (nodes[from] && nodes[to]) {
            nodes[from].children.push(nodes[to]);
        }
    });

    return nodes[me.id];
}

const data = convertData(elements, connections);

let width = window.innerWidth;
let height = window.innerHeight;

window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;

    d3.select("#map-view")
        .attr("width", width)
        .attr("height", height)
        .select("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);
});
const radius = width / 2;

const tree = d3.tree()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent === b.parent ? 1 : 4) / a.depth);

const root = d3.hierarchy(data);
tree(root);

const svg = d3.select("#map").append("svg")
    .attr("id", "map-view")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom()
        .scaleExtent([1 / 2, 5])
        .on("zoom", (event) => {
            svg.attr("transform", event.transform);
        }))
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

svg.selectAll(".link")
    .data(root.links())
    .join("path")
    .attr("class", "link")
    .attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y));

const node = svg.selectAll(".node")
    .data(root.descendants())
    .join("g")
    .attr("class", "node")
    .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
    .append("g")
    .attr("transform", d => `rotate(${90 - d.x * 180 / Math.PI})`);

node.filter(d => d.data.type === "rect")
    .append("rect")
    .attr("x", -32)
    .attr("y", -32)
    .attr("width", 64)
    .attr("height", 64)
    .attr("fill", "var(--place-background)")
    .attr("stroke-width", 2)
    .attr("stroke", "var(--place-border)");

node.filter(d => d.data.type === "circle")
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 32)
    .attr("fill", "var(--person-background)")
    .attr("stroke-width", 2)
    .attr("stroke", "var(--person-border)");

node.filter(d => d.data.image)
    .append("image")
    .attr("xlink:href", d => d.data.image)
    .attr("x", -32)
    .attr("y", -32)
    .attr("width", 64)
    .attr("height", 64)
    .attr("class", d => d.data.type);

node.append("text")
    .attr("dy", d => d.data.image ? 48 : 0)
    .attr("x", 0)
    .attr("text-anchor", "middle")
    .text(d => d.data.name);
