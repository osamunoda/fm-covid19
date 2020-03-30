import * as d3 from 'd3';
import 'd3-selection-multi';

/** Downloadable Covid-19 Database: https://github.com/CSSEGISandData/COVID-19 
 * This github link is introduced here. https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6
*/
const url_confirmed = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
const url_death = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
const url_recovered = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv";
const urls = {
    confirmed: url_confirmed,
    death: url_death,
    recovered: url_recovered
};

let selected = ["US", "Italy", "Japan"]; // Default countries to show
const color = d3.scaleOrdinal(d3.schemeCategory10);

fetch(url_confirmed)
    .then(response => response.text()).then(result => {
        viz(summerize(result), selected);
        init(selected);
    });

/** define radiobutton-change handler */
document.querySelectorAll("input[type='radio']").forEach(item => {
    item.onclick = () => {
        update();
    }
})

/**
 *  Functions
 */

/**
 * Parse downloaded data
 * In the downloaded data, Australia, China, Canada are special. These countries are reported as state/country style.
 * (Using addCountry function, sum(state date) is calculated.)
 * @param {*} csv 
 */
function summerize(csv) {
    const arr = csv.split("\n");
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
    countries.sort((a, b) => b.latest - a.latest);
    d3.select("#latestDate").text("Last Updated: " + arr[0].split(",").slice(-1)[0]);
    // Countries list
    panels(countries);
    return countries;
}
/**
 * 
 * @param {*} arr : downloaded csv split by \n
 * @param {*} allCountries prased csv data
 * @param {*} countryName string[] 
 * @param {*} dataLength length of occurence data array
 * @param {*} excludes state to be excluded
 */
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
/**
 * Visualize Data
 * @param {*} countries parsed data from csv
 * @param {*} selected string[], default country names
 */
function viz(countries, selected) {
    const width = 640, height = 440, margin = 70;
    d3.select("svg").style("width", width).style("height", height);
    const maxY = d3.max(countries.map(item => item.latest).concat([1000000]));
    // scale
    const scaleX = d3.scaleLinear().domain([0, countries[0].data.length]).range([margin, width - margin]);
    const scaleY = d3.scaleLog(10).clamp(true).domain([1, maxY]).range([height - margin, margin]);
    const color2 = d3.scaleOrdinal().range(d3.schemeCategory10);
    //axes
    const axisX = d3.axisBottom(scaleX);
    const axisY = d3.axisLeft(scaleY).ticks(10, 0).tickSize(-500).ticks(5).tickFormat(d => d);
    d3.select("svg").append("g").call(axisY).attr("transform", `translate(${margin},0)`);
    d3.select("svg").append("g").call(axisX).attr("transform", `translate(0, ${height - margin})`);
    // Data filtering
    const filtered = countries.filter(country => selected.indexOf(country.name) !== -1);
    const svg = d3.select("svg");
    // Draw lines
    svg.selectAll("path.line").data(filtered.map(item => item.data)).join("path").attr("class", "line").attrs({
        d: d3.line().x((d, i) => scaleX(i)).y((d, i) => scaleY(d)),
        stroke: (d, i) => color2(i),
        fill: "none",
        "stroke-width": 2
    });
    // show country name at the end of line
    svg.selectAll("text.cname").data(filtered).join("text").attr("class", "cname").attrs({
        x: (d, i) => scaleX(d.data.length),
        y: (d, i) => scaleY(d.data[d.data.length - 1]),
        stroke: "none",
        fill: (d, i) => color2(i)
    }).text(d => d.name);
}
/**
 * List country names by count descending
 * add click-handler
 * @param {*} countries parsed data from csv
 */
function panels(countries) {
    d3.select("div#container").styles({
        display: "inline-block",
        width: "250px",
        height: "500px",
        overflow: "scroll",
        "border": "1px solid"
    });
    d3.select("div#container").selectAll("div.cell").data(countries).join("div").attr("class", "cell").styles({
        width: "250px",
        "box-sizing": "border-box",
        height: "30px",
        border: "1px solid #ccc",
        display: "flex",
        "justify-content": "space-between",
        font: "16px/30px sans-serif",
        padding: "0 1rem",
        background: "white"
    }).html((d, index) => "<div><input style='width:1px;visibility:hidden' type='checkbox'/>" + (index + 1) + " <span>" + d.name + "</span></div><div>" + d3.format(",")(d.latest) + "</div>")
        .on("click", (d, i, n) => {
            const checker = n[i].querySelector("input");
            checker.checked = !checker.checked;
            if (checker.checked) {
                selected.push(d.name)
            } else {
                selected = selected.filter(item => item !== d.name)
            }
            update();
        });

}
/**
 * Redraw the line graph
 */
function update() {
    const target = Array.from(document.querySelectorAll("input:checked+span")).map(item => item.textContent);
    // specify the url via radiobuttons
    const url = urls[document.querySelector("input[type='radio']:checked").id];

    fetch(url).then(response => response.text()).then(result => {
        viz(summerize(result), target);
        init(selected);
    });
}
/**
 * Reset country list after update
 * @param {*} selected string[] selected countries
 */
function init(selected) {
    const items = document.querySelectorAll("#container>div");
    let counter = 0;
    items.forEach(item => {
        if (selected.indexOf(item.querySelector("input + span").textContent) !== -1) {
            item.style.background = color(counter);
            item.style.color = "white";
            item.querySelector("input").checked = true;
            counter++;
        } else {
            item.style.background = "white";
            item.style.color = "black";
            item.querySelector("input").checked = false;
        }
    });
}

