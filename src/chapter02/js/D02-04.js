const show = () => {
  // DEFINITIONS ///////////////////////////
  const margin = { top: 20, bottom: 50, right: 20, left: 45 },
    width = 750 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const chartG = d3
    .select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // CONVERTER ///////////////////////////
  const rowToNumbers = (row) => {
    for (const property in row) {
      if (row.hasOwnProperty(property)) row[property] = +row[property];
    }
    return row;
  };

  // LOAD DATA ////////////////////////////
  d3.csv("./data/populationFiltered.csv", rowToNumbers).then((data) => {
    //scales
    var scaleX = d3
      .scaleBand()
      .domain(data.map((d) => d.year))
      .range([0, width])
      .padding(0.15);
    const scaleY = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total)])
      .range([height, 0]);
    const scaleC = (i) => d3.interpolateCool(i / 10);

    // break into stacked format
    const stack = d3.stack().keys(d3.range(0, 10));
    const series = stack(data);

    chartG
      .selectAll("g")
      .data(series)
      .enter()
      .append("g")
      .attr("fill", (d) => scaleC(d.key))
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", (d) => scaleX(d.data.year))
      .attr("y", (d) => scaleY(d[1]))
      .attr("height", (d) => scaleY(d[0]) - scaleY(d[1]))
      .attr("width", scaleX.bandwidth());

    // may as well do the axis.
    const bottomAxisGen = d3.axisBottom().scale(scaleX);
    const bottomAxisG = chartG
      .append("g")
      .attr("transform", `translate(0, ${scaleY(0)})`)
      .call(bottomAxisGen);
    bottomAxisG
      .selectAll(".tick text")
      .attr("transform", "rotate(90) translate(20, -13)");

    const leftAxisGen = d3.axisLeft().scale(scaleY).ticks(15, "s");
    chart.append("g").call(leftAxisGen);
  });
};
