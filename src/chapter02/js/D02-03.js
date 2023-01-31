const show = () => {
  // DEFINITIONS ///////////////////////////
  const margin = { top: 20, bottom: 20, right: 35, left: 35 },
    width = 750 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const chart = d3
    .select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // LOAD DATA ////////////////////////////
  const rowToNumbers = (row) => {
    for (const property in row) {
      if (row.hasOwnProperty(property)) row[property] = +row[property];
    }
    return row;
  };

  const asPercentage = (row, value) => (value / row.data.total) * 100;

  d3.csv("./data/populationFiltered.csv", rowToNumbers).then((data) => {
    //scales
    var scaleX = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([0, width]);
    const scaleY = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    const scaleC = (i) => d3.interpolateWarm(i / 9);

    // break into stacked format
    const stack = d3.stack().keys(d3.range(0, 10));
    const series = stack(data);

    //area generator
    const areaStacked = d3
      .area()
      .x((_d, i) => scaleX(i))
      .y0((d) => scaleY(asPercentage(d, d[0])))
      .y1((d) => scaleY(asPercentage(d, d[1])));

    const serieG = chart.selectAll("g").data(series).enter().append("g");
    serieG
      .append("path")
      .style("fill", (d) => scaleC(d.key))
      .attr("d", areaStacked);

    // may as well do the axis.
    const bottomAxis = d3.axisBottom().scale(scaleX).ticks(20, "r");
    const bottomAxisG = chart
      .append("g")
      .attr("transform", `translate(0, ${scaleY(0)})`)
      .call(bottomAxis);
    bottomAxisG.selectAll(".tick text").text((d) => 2014 + d);

    const leftAxis = d3.axisLeft().scale(scaleY).ticks(10, "r");
    chart.append("g").call(leftAxis);

    const rightAxis = d3.axisRight().scale(scaleY).ticks(10, "r");
    chart.append("g").attr("transform", `translate(${width})`).call(rightAxis);
  });
};
