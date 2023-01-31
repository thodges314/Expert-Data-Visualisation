const show = () => {
  const margin = { top: 20, bottom: 30, right: 40, left: 40 };
  const width = 800 - margin.left - margin.right;
  const height = 1200 - margin.top - margin.bottom;

  const chartG = d3
    .select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const namesToShow = 20;
  const barWidth = 20;
  const barMargin = 5;

  d3.csv("data/yob1980.txt", (d) => ({
    name: d.name,
    sex: d.sex,
    amount: +d.amount,
  })).then((data) => {
    const grouped = data.reduce((acc, cv) => {
      if (!acc.hasOwnProperty(cv.sex)) acc[cv.sex] = [];
      acc[cv.sex].push(cv);
      return acc;
    }, {});
    const top10F = grouped["F"].slice(0, namesToShow);
    const top10M = grouped["M"].slice(0, namesToShow);
    const both = top10F.concat(top10M.reverse());

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(both, (d) => d.amount)])
      .range([0, width - margin.right]);

    const bars = chartG
      .selectAll("g")
      .data(both)
      .enter()
      .append("g")
      .attr("transform", (_d, i) => {
        const yPos = (barWidth + barMargin) * i;
        return `translate (0, ${yPos})`;
      });

    bars
      .append("rect")
      .attr("height", barWidth)
      .attr("width", (d) => yScale(d.amount))
      .attr("class", (d) => (d.sex === "F" ? "female" : "male"));
    bars
      .append("text")
      .attr("x", (d) => yScale(d.amount) + 5)
      .attr("y", barWidth / 2)
      .attr("dy", ".35em")
      .text((d) => d.name);

    // make axis

    const bottomAxisGen = d3.axisBottom().scale(yScale).ticks(20, "s");
    const topAxisGen = d3.axisTop().scale(yScale).ticks(20, "s");

    chartG
      .append("g")
      .attr(
        "transform",
        `translate( 0, ${both.length * (barWidth + barMargin)})`
      )
      .call(bottomAxisGen);

    chartG
      .append("g")
      .attr("transform", `translate( 0, ${-barMargin})`)
      .call(topAxisGen);
  });
};
