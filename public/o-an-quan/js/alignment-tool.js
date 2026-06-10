document.addEventListener("DOMContentLoaded", () => {
    const styleEl = document.createElement("style");
    document.head.appendChild(styleEl);

    const panel = document.createElement("div");
    panel.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0,0,0,0.9);
        color: lime;
        padding: 15px;
        border: 1px solid lime;
        border-radius: 8px;
        z-index: 10000;
        font-family: monospace;
        font-size: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;

    const config = {
        centerGap: { label: ".pits-center GAP", val: 48, min: 0, max: 150 },
        centerMt: { label: ".pits-center MARGIN-TOP", val: 14, min: -100, max: 100 },
        danContGap: { label: ".dan-pits-container GAP", val: 18, min: 0, max: 100 },
        danW: { label: ".dan-pit WIDTH", val: 88, min: 50, max: 150 },
        danH: { label: ".dan-pit HEIGHT", val: 88, min: 50, max: 150 },
        quanW: { label: ".quan-pit WIDTH", val: 120, min: 50, max: 250 },
        quanH: { label: ".quan-pit HEIGHT", val: 255, min: 100, max: 350 },
        leftQuanX: { label: ".left-quan TRANSLATEX", val: -53, min: -150, max: 150 },
        rightQuanX: { label: ".right-quan TRANSLATEX", val: 53, min: -150, max: 150 }
    };

    const inputs = {};

    Object.keys(config).forEach(key => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        
        const lbl = document.createElement("label");
        lbl.innerText = config[key].label;
        lbl.style.marginRight = "10px";

        const input = document.createElement("input");
        input.type = "range";
        input.min = config[key].min;
        input.max = config[key].max;
        input.value = config[key].val;

        const valSpan = document.createElement("span");
        valSpan.innerText = input.value + "px";
        valSpan.style.width = "40px";
        valSpan.style.textAlign = "right";

        input.oninput = (e) => {
            valSpan.innerText = e.target.value + "px";
            updateStyles();
        };

        inputs[key] = input;

        row.appendChild(lbl);
        row.appendChild(input);
        row.appendChild(valSpan);
        panel.appendChild(row);
    });

    const updateStyles = () => {
        const css = `
            .pits-center { gap: ${inputs.centerGap.value}px !important; margin-top: ${inputs.centerMt.value}px !important; }
            .dan-pits-container { gap: ${inputs.danContGap.value}px !important; }
            .pit.dan-pit { width: ${inputs.danW.value}px !important; height: ${inputs.danH.value}px !important; }
            .pit.quan-pit { width: ${inputs.quanW.value}px !important; height: ${inputs.quanH.value}px !important; }
            .quan-pit-container.left-quan { transform: translateX(${inputs.leftQuanX.value}px) !important; }
            .quan-pit-container.right-quan { transform: translateX(${inputs.rightQuanX.value}px) !important; }
        `;
        styleEl.innerHTML = css;
    };

    const copyBtn = document.createElement("button");
    copyBtn.innerText = "Hiện CSS hoàn chỉnh";
    copyBtn.style.marginTop = "10px";
    copyBtn.style.padding = "5px";
    copyBtn.style.cursor = "pointer";
    copyBtn.onclick = () => {
        prompt("Copy mã CSS này gửi lại cho AI:", styleEl.innerHTML.replace(/ !important/g, "").replace(/\\s+/g, " "));
    };
    
    panel.appendChild(copyBtn);
    document.body.appendChild(panel);

    // Initial update
    updateStyles();
});
