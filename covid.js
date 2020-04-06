import * as d3 from 'd3';
import 'd3-selection-multi';
import './burger';
import './sidePanel';

const url_confirmed = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
const url_death = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
const url_recovered = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv";

const urls = [url_confirmed, url_death, url_recovered];
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const state = {
    confirmed: [],
    death: [],
    recovered: [],
    active: [],
    countries: ["US", "Italy", "Japan"],
    country: "Japan",
    axisType: "logarythmic",
    selectedType: "confirmed"
}
const chart_config = {};
let timer = null;

Promise.all(urls.map(url => fetch(url).then(response => response.text())))
    .then(result => {
        state.confirmed = summerize(result[0]);
        state.death = summerize(result[1]);
        state.recovered = summerize(result[2]);
        state.active = getActive(state.confirmed, state.death, state.recovered);
        setup_optionHandlers();
        const headerRow = result[0].split("\n")[0].split(",");
        d3.select("#selectedCountry").text("Selected Country: " + state.country).attr("text-align", "right");
        d3.select("#latestDate").text("Last Updated: " + headerRow[headerRow.length - 1]);
        update();
    });
window.onresize = function () {
    timer = setTimeout(() => {
        if (timer) {
            clearTimeout(timer);
        }
        update();
    }, 200);
}
function update_config() {
    chart_config.width = window.innerWidth > 1023 ? (document.querySelector("section").getBoundingClientRect().width - 250) : document.querySelector("section").getBoundingClientRect().width;
    chart_config.height = window.innerWidth > 480 ? 450 : 350;
    chart_config.margin = 70;
    chart_config.oneColumn = window.innerWidth < 1024
}
function update() {
    update_config();
    const data = state[state.selectedType];
    ListCountries(data, "#container", "checkbox", "#sidepanel");
    ListCountries(data, "#container2", "radio", "#sidepanel2");
    LineChart(data, "#s1", chart_config);
    BarChart(data, "#s2", state.axisType, chart_config);
}
function setup_optionHandlers() {
    d3.select("#caseTypes").selectAll("input+label").on("click", (d, i, n) => {
        state.selectedType = n[i].getAttribute("for");
        d3.select("div.subTitle").text(n[i].textContent + " Daily Count");
        update();
    });
    d3.select("#caseTypes").selectAll("input").on("click", (d, i, n) => {
        state.selectedType = document.querySelector("#caseTypes input:checked").value;
        const str = state.selectedType.slice(0, 1).toUpperCase() + state.selectedType.slice(1);
        d3.select("div.subTitle").text(str + " Daily Count")
        update();
    });
    d3.selectAll("#dailyCount input+label").on("click", (d, i, n) => {
        state.axisType = n[i].textContent.toLowerCase();
        update();
    });
    d3.selectAll("#dailyCount input").on("click", (d, i, n) => {
        state.axisType = n[i].value;
        update();
    });
}

function ListCountries(data, elm, type, shadow) {
    data.sort((a, b) => b.latest - a.latest);
    let baseElement = d3.select(elm);
    const shadowElm = document.querySelector(shadow);
    if (shadowElm) {
        const shadowRoot = shadowElm.shadowRoot;
        if (shadowRoot) {
            const temp = shadowRoot.querySelector(elm);
            if (temp) {
                baseElement = d3.select(temp);
            }
        }
    }
    baseElement.styles({
        display: "inline-block",
        width: "250px",
        height: "100%",
        overflow: "scroll",
        "border": "1px solid"
    });
    const rowBack = (d, i) => {
        let color = "white";
        if (type === "radio") {
            if (state.country === d) {
                color = "#333"
            }
        } else if (type === "checkbox") {
            const index = state.countries.indexOf(d);
            if (index !== -1) {
                color = colorScale(index)
            }
        } else {

        }
        return color;
    };
    const rowColor = (d, i) => {
        let color = "black";
        if (type === "radio") {
            if (state.country === d) {
                color = "white"
            }
        } else if (type === "checkbox") {
            const index = state.countries.indexOf(d);
            if (index !== -1) {
                color = "white"
            }
        } else {

        }
        return color;
    };
    const checker = (d, i) => {
        let check = "";
        if (type === "radio") {
            if (state.country === d) {
                check = " checked";
            }
        } else if (type === "checkbox") {
            const index = state.countries.indexOf(d);
            if (index !== -1) {
                check = " checked";
            }
        } else {

        }
        return check;
    };
    baseElement.selectAll("div." + type).data(data).join("div").attr("class", type)
        .styles({
            width: "250px",
            "box-sizing": "border-box",
            height: "30px",
            border: "1px solid #ccc",
            display: "flex",
            "justify-content": "space-between",
            font: "16px/30px sans-serif",
            padding: "0 1rem",
            background: (d, i) => rowBack(d.name, i),
            color: (d, i) => rowColor(d.name, i)
        }).html((d, index) => "<div><input" + checker(d.name) + " style='width:1px;visibility:hidden' type='" + type + "'/>" + (index + 1) + " <span>" + d.name + "</span></div><div>" + d3.format(",")(d.latest) + "</div>")
        .on("click", (d, i, n) => {
            if (type === "checkbox") {
                const checker = n[i].querySelector("input");
                checker.checked = !checker.checked;

                if (checker.checked) {
                    state.countries.push(d.name)
                } else {
                    state.countries = state.countries.filter(item => item !== d.name)
                }
                n[i].style.background = rowBack(d.name);
                n[i].style.color = rowColor(d.name);
            } else if (type === "radio") {
                const checker = n[i].querySelector("input[type='radio']");
                checker.checked = true;
                state.country = d.name;
                d3.select("#selectedCountry").text("Selected Country: " + state.country).attr("text-align", "right");
                const lines = n[i].parentElement.querySelectorAll("div.radio");
                lines.forEach(line => {
                    line.style.background = "white";
                    line.style.color = "black";
                    line.querySelector("input").checked = false;
                })
                n[i].style.background = rowBack(d.name);
                n[i].style.color = rowColor(d.name);
                n[i].querySelector("input").checked = true;

            }
            update();
        });
}
function sanitize(csv) {
    const arr = csv.split("\n");
    const result = arr.map(item => item.split(/[^0-9a-zA-Z ,\.]/).join(""))
    return result;
}
function summerize(csv) {
    const arr = sanitize(csv);
    const countries = [];
    arr.forEach(row => {
        const data = row.split(",");
        if (data[0] || countries.find(item => item.name === data[1])) return;
        countries.push({
            name: data[1],
            data: data.slice(4).map(item => Number(item)),
            latest: Number(data[data.length - 1])
        });
    });
    const dataLength = countries[0].data.length;
    addCountry(arr, countries, "Australia", dataLength);
    addCountry(arr, countries, "China", dataLength);
    addCountry(arr, countries, "Canada", dataLength, ["Diamond Princess", "Recovered"]);
    return countries;
}
function addCountry(arr, allCountries, countryName, dataLength, excludes) {
    const country_states = arr.filter(row => {
        const state = row.split(",")[0];
        if (excludes) {
            return row.match(countryName) && !excludes.includes(state)
        } else {
            return row.match(countryName);
        }
    });
    const country = {
        name: countryName,
        data: Array(dataLength).fill(0)
    };
    country_states.forEach(row => {
        const data = row.split(",").slice(4).map(item => Number(item));
        country.data.forEach((item, index) => {
            country.data[index] = item + data[index];
        });
    });
    country.latest = country.data[country.data.length - 1];
    allCountries.push(country);
}
function getActive(confirmed, death, recovered) {
    const active = Array(confirmed.length).fill({});
    const result = active.map((item, i) => {
        const country = confirmed[i].name;
        const data = confirmed[i].data;
        const d_array = death.find(item => item.name === country).data;
        const r_array = recovered.find(item => item.name === country).data;
        const a_array = data.map((item, index) => {
            return (item - d_array[index] - r_array[index])
        });
        return { name: country, data: a_array, latest: a_array[a_array.length - 1] }
    });
    return result;
}
function LineChart(data, elmID, config) {
    const countries = data;
    const width = config.width, height = config.height, margin = config.margin;
    d3.select(elmID).style("width", width).style("height", height);
    const maxY = d3.max(countries.map(item => item.latest).concat([1000000]));
    // scale
    const scaleX = d3.scaleLinear().domain([0, countries[0].data.length]).range([margin, width - margin]);
    const scaleY = d3.scaleLog(10).clamp(true).domain([1, maxY]).range([height - margin, margin]);

    //axes
    const axisX = d3.axisBottom(scaleX);
    const axisY = d3.axisLeft(scaleY).ticks(10, 0).tickSize(chart_config.margin * 2 - chart_config.width).ticks(5).tickFormat(d => d);
    d3.select("svg").selectAll("g").remove();
    d3.select("svg").append("g").call(axisY).attr("transform", `translate(${margin},0)`);
    d3.select("svg").append("g").call(axisX).attr("transform", `translate(0, ${height - margin})`);
    // Data filtering
    const filtered = countries.filter(country => state.countries.indexOf(country.name) !== -1);
    const svg = d3.select(elmID);
    // Draw lines
    svg.selectAll("path.line").data(filtered.map(item => item.data)).join("path").attr("class", "line").attrs({
        d: d3.line().x((d, i) => scaleX(i)).y((d, i) => scaleY(d)),
        stroke: (d, i) => colorScale(state.countries.indexOf(filtered[i].name)),
        fill: "none",
        "stroke-width": 2
    });
    // show country name at the end of line
    svg.selectAll("text.cname").data(filtered).join("text").attr("class", "cname").attrs({
        x: (d, i) => scaleX(d.data.length),
        y: (d, i) => scaleY(d.data[d.data.length - 1]),
        stroke: "none",
        fill: (d, i) => colorScale(state.countries.indexOf(d.name))
    }).text(d => d.name);
}
function BarChart(data, elmID, type, config) {
    const countries = data;
    const country = countries.find(item => item.name === state.country);
    const width = config.width, height = config.height, margin = config.margin;
    const cases_day = country.data.map((item, index, arr) => index === 0 ? item : (arr[index] - arr[index - 1]));
    const bar_width = (width - margin * 2) / cases_day.length;
    const svg = d3.select(elmID);
    svg.style("width", width).style("height", height);
    const maxY = type === "logarithmic" ? 100000 : d3.max(cases_day);
    // scale
    const scaleX = d3.scaleLinear().domain([0, cases_day.length]).range([margin, width - margin]);
    const scaleY = type === "logarithmic" ? d3.scaleLog(10).clamp(true).domain([1, maxY]).range([height - margin, margin]) : d3.scaleLinear().domain([0, maxY]).range([height - margin, margin]);
    //axes
    const axisX = d3.axisBottom(scaleX);
    const axisY = d3.axisLeft(scaleY).ticks(10, 0).tickSize(chart_config.margin * 2 - chart_config.width).ticks(5).tickFormat(d => d);
    svg.selectAll("g").remove();
    svg.append("g").call(axisY).attr("transform", `translate(${margin},0)`);
    svg.append("g").call(axisX).attr("transform", `translate(0, ${height - margin})`);
    // Data filtering
    svg.selectAll("rect").data(cases_day).join("rect").attrs({
        stroke: "white",
        fill: "#333",
        x: (d, i) => (scaleY(0) - scaleY(d)) > 0 ? scaleX(i) : 0,
        y: d => scaleY(d),
        width: bar_width,
        height: d => Math.abs(scaleY(0) - scaleY(d))
    });
}