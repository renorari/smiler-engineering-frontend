/* TSUNAGARI Map */
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// 仮データ
const elements = [
    // { "id": "a", "name": "DERTA", "image": "/temp/ed9d4233a75aea4b33cc6b1b10bbdfc2.png", "type": "event" },
    // { "id": "b", "name": "佐藤 太郎", "image": "/temp/60b65390-4495-406a-9b96-88e8fad733f0.jpeg", "type": "person" },
    // { "id": "c", "name": "鈴木 花子", "image": "/temp/39f7e5f1-47aa-425f-bb85-4f6c9f54ca18.jpg", "type": "person" },
    // { "id": "d", "name": "長岡市", "image": "/temp/e403IG00000270.jpg", "type": "place" }
];

const connections = [
    // { "from": "me", "to": "a" },
    // { "from": "a", "to": "b" },
    // { "from": "a", "to": "c" },
    // { "from": "me", "to": "d" }
];

const me = {
    id: "me",
    name: "私",
    image: null,
    type: "person"
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
const border = 2;

const svg = d3.select("#map").append("svg")
    .attr("id", "map-view")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom()
        .scaleExtent([1 / 10, 5])
        .on("zoom", (event) => {
            svg.attr("transform", event.transform);
        }))
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

function render() {
    const data = convertData(elements, connections);
    const radius = connections.length < 5 ? connections.length * 32 : 160;

    const tree = d3.tree()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent === b.parent ? 1 : 4) / a.depth);

    const root = d3.hierarchy(data);
    tree(root);

    svg.selectAll(".link")
        .data(root.links())
        .join("path")
        .attr("class", "link")
        .attr("d", d3.linkRadial()
            .angle(d => d.x)
            .radius(d => d.y))
        .lower();

    const node = svg.selectAll(".node")
        .data(root.descendants())
        .join("g")
        .attr("class", "node")
        .attr("id", d => d.data.id)
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .append("g")
        .attr("transform", d => `rotate(${90 - d.x * 180 / Math.PI})`);

    node.filter(d => d.data.type === "place")
        .append("rect")
        .attr("x", -32)
        .attr("y", -32)
        .attr("width", 64)
        .attr("height", 64)
        .attr("fill", "var(--place-background)")
        .attr("paint-order", "stroke")
        .attr("stroke-width", border * 2)
        .attr("stroke", "var(--place-border)");

    node.filter(d => d.data.type === "event")
        .append("rect")
        .attr("x", -32)
        .attr("y", -32)
        .attr("width", 64)
        .attr("height", 64)
        .attr("fill", "var(--event-background)")
        .attr("paint-order", "stroke")
        .attr("stroke-width", border * 2)
        .attr("stroke", "var(--event-border)");

    node.filter(d => d.data.type === "person")
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 32)
        .attr("fill", (d) => d.data.id === "me" ? "var(--me-background)" : "var(--person-background)")
        .attr("paint-order", "stroke")
        .attr("stroke-width", border * 2)
        .attr("stroke", (d) => d.data.id === "me" ? "var(--me-border)" : "var(--person-border)");

    node.filter(d => d.data.image)
        .append("image")
        .attr("xlink:href", d => d.data.image)
        .attr("x", -32)
        .attr("y", -32)
        .attr("width", 64)
        .attr("height", 64)
        .attr("class", d => d.data.type);

    node.append("text")
        .attr("dy", d => d.data.image ? 64 : 0)
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "var(--text-color)")
        .attr("font-size", d => d.data.image ? 16 : 64 / (d.data.name.length + 1))
        .text(d => d.data.name);

    // ものが選択されている時に、マップ上のオブジェクトが押されたら、繋げる
    const mapObjects = document.querySelectorAll("#map .node");
    mapObjects.forEach((object) => {
        object.addEventListener("click", () => {
            const mapObjectId = object.id;
            const selectedObjects = document.querySelectorAll("#objects .object.selected");
            if (selectedObjects.length === 0) {
                return;
            }

            selectedObjects.forEach((selectedObject) => {
                const selectedObjectId = selectedObject.id;
                connections.push({ "to": selectedObjectId, "from": mapObjectId });
                selectedObject.remove();
                render();
            });

            console.log(elements, connections);
        });
    });
}
render();

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
    // 全ての項目をリセット
    document.querySelector("#add #type-person").checked = false;
    document.querySelector("#add #type-place").checked = false;
    document.querySelector("#add #type-event").checked = false;
    document.querySelector("#add #basic-info").classList.add("is-hidden");
    document.querySelector("#add #add-person").classList.add("is-hidden");
    document.querySelector("#add #add-place").classList.add("is-hidden");
    document.querySelector("#add #add-event").classList.add("is-hidden");
    document.querySelector("#add #name").value = "";
    document.querySelector("#add #image").value = "";
}
addModalClose.addEventListener("click", closeAddModal);
addModalCancel.addEventListener("click", closeAddModal);

// タイプによって表示を切り替える
const typePerson = document.querySelector("#type-person");
typePerson.addEventListener("click", () => {
    document.querySelector("#add #basic-info").classList.remove("is-hidden");
    document.querySelector("#add #add-person").classList.remove("is-hidden");
    document.querySelector("#add #add-place").classList.add("is-hidden");
    document.querySelector("#add #add-event").classList.add("is-hidden");
});
const typePlace = document.querySelector("#type-place");
typePlace.addEventListener("click", () => {
    document.querySelector("#add #basic-info").classList.remove("is-hidden");
    document.querySelector("#add #add-person").classList.add("is-hidden");
    document.querySelector("#add #add-place").classList.remove("is-hidden");
    document.querySelector("#add #add-event").classList.add("is-hidden");
});
const typeEvent = document.querySelector("#type-event");
typeEvent.addEventListener("click", () => {
    document.querySelector("#add #basic-info").classList.remove("is-hidden");
    document.querySelector("#add #add-person").classList.add("is-hidden");
    document.querySelector("#add #add-place").classList.add("is-hidden");
    document.querySelector("#add #add-event").classList.remove("is-hidden");
});

function ImageToBase64(img, mime_type) {
    // New Canvas
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    // Draw Image
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // To Base64
    return canvas.toDataURL(mime_type);
}

// 追加
document.querySelector("#add-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const type = document.querySelector("#add input[name=type]:checked").value;
    const name = document.querySelector("#add #name").value;
    const imageFile = document.querySelector("#add #image").files[0];
    const image = imageFile ? ImageToBase64(URL.createObjectURL(imageFile), "image/png") : null;
    const id = Math.random().toString(36).slice(-8);

    elements.push({ id, name, image, type });
    closeAddModal();

    const object = document.createElement("div");
    object.id = id;
    object.classList.add("object");
    if (image) {
        const img = document.createElement("img");
        img.src = image;
        object.appendChild(img);
    }
    const p = document.createElement("p");
    p.textContent = name;
    object.appendChild(p);
    object.addEventListener("click", () => {
        object.classList.toggle("selected");
    });
    document.querySelector("#objects").appendChild(object);
});