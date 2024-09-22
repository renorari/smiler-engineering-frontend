/* TSUNAGARI Map */
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// 仮データ
const elements = [
    { "id": "a", "name": "DERTA", "image": "/temp/ed9d4233a75aea4b33cc6b1b10bbdfc2.png", "type": "rect" },
    { "id": "b", "name": "佐藤 太郎", "image": "/temp/60b65390-4495-406a-9b96-88e8fad733f0.jpeg", "type": "circle" },
    { "id": "c", "name": "鈴木 花子", "image": "/temp/39f7e5f1-47aa-425f-bb85-4f6c9f54ca18.jpg", "type": "circle" },
    { "id": "d", "name": "長岡市", "image": "/temp/e403IG00000270.jpg", "type": "rect" },
    { "id": "e", "name": "高橋 一郎", "image": "/temp/ad506e1d-a90e-4315-9fe0-586f3347cfcf.jpg", "type": "circle" },
    { "id": "f", "name": "山本 翔", "image": "/temp/cc5a9ab6-c8b2-42ec-b5ee-155f0a3c6e50.jpg", "type": "circle" },
    { "id": "g", "name": "渡辺 健太", "image": "/temp/d4fbb9bb-5f56-466c-92dc-e4babafaab10.jpg", "type": "circle" },
    { "id": "h", "name": "伊藤 由美", "image": null, "type": "circle" },
    { "id": "i", "name": "Startup Weekend", "image": "/temp/sw-logo.png", "type": "rect" },
    { "id": "j", "name": "田中 美咲", "image": "/temp/joshua-rawson-harris-YNaSz-E7Qss-unsplash.jpg", "type": "circle" },
    { "id": "k", "name": "中村 真奈", "image": null, "type": "circle" },
    { "id": "l", "name": "小林 大輔", "image": null, "type": "circle" },
    { "id": "m", "name": "加藤 里奈", "image": null, "type": "circle" },
    { "id": "n", "name": "佐々木 健", "image": null, "type": "circle" },
    { "id": "o", "name": "松本 直子", "image": null, "type": "circle" },
    { "id": "p", "name": "藤田 亮", "image": null, "type": "circle" },
    { "id": "q", "name": "石田 美穂", "image": null, "type": "circle" },
    { "id": "r", "name": "山田 太郎", "image": null, "type": "circle" },
    { "id": "s", "name": "木村 花子", "image": null, "type": "circle" },
    { "id": "t", "name": "井上 一郎", "image": null, "type": "circle" }
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
    { "from": "b", "to": "i" },
    { "from": "i", "to": "j" },
    { "from": "i", "to": "k" },
    { "from": "i", "to": "l" },
    { "from": "i", "to": "m" },
    { "from": "a", "to": "n" },
    { "from": "a", "to": "o" },
    { "from": "o", "to": "p" },
    { "from": "o", "to": "q" },
    { "from": "o", "to": "r" },
    { "from": "o", "to": "s" },
    { "from": "o", "to": "t" }
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
const radius = connections.length * 32;

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
        .scaleExtent([1 / 10, 2])
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
    .attr("dy", d => d.data.image ? 48 : 4)
    .attr("x", 0)
    .attr("text-anchor", "middle")
    .text(d => d.data.name);

// 追加ボタン
const addButton = document.querySelector("#add-button");
const addModal = document.querySelector("#add");
addButton.addEventListener("click", () => {
    addModal.classList.add("is-active");
});

// 追加モーダル
const addModalClose = document.querySelector("#add button.delete");
const addModalCancel = document.querySelector("#add button.cancel");
function closeAddModal() {
    addModal.classList.remove("is-active");
}
addModalClose.addEventListener("click", closeAddModal);
addModalCancel.addEventListener("click", closeAddModal);

// タイプによって表示を切り替える
const typePerson = document.querySelector("#type-person");
typePerson.addEventListener("click", () => {
    document.querySelector("#add #add-person").classList.remove("is-hidden");
    document.querySelector("#add #add-place").classList.add("is-hidden");
    document.querySelector("#add #add-event").classList.add("is-hidden");
});
const typePlace = document.querySelector("#type-place");
typePlace.addEventListener("click", () => {
    document.querySelector("#add #add-person").classList.add("is-hidden");
    document.querySelector("#add #add-place").classList.remove("is-hidden");
    document.querySelector("#add #add-event").classList.add("is-hidden");
});
const typeEvent = document.querySelector("#type-event");
typeEvent.addEventListener("click", () => {
    document.querySelector("#add #add-person").classList.add("is-hidden");
    document.querySelector("#add #add-place").classList.add("is-hidden");
    document.querySelector("#add #add-event").classList.remove("is-hidden");
});