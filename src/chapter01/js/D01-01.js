const show = () => {
  const margin = { top: 20, bottom: 30, right: 40, left: 40 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  const rectangleWidth = 100;

  const chart = d3
    .select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const update = () => {
    const numberOfRectangles = Math.ceil(Math.random() * 7);
    const data = [];
    for (let i = 0; i < numberOfRectangles; i++) {
      data.push((Math.random() * rectangleWidth) / 2 + rectangleWidth / 2);
    }

    //assign data to rectangles, should there be any
    const rectangles = chart.selectAll("rect").data(data);

    //set a style on existing rectangles so we can see them
    rectangles
      .transition()
      .attr("class", "update")
      .attr("width", (d) => d)
      .attr("height", (d) => d);

    rectangles
      .enter()
      .append("rect")
      .attr("class", "enter")
      .attr("x", (_d, i) => i * (rectangleWidth + 5))
      .attr("y", 50)
      .transition()
      .attr("width", (d) => d)
      .attr("height", (d) => d);

    rectangles.exit().transition().remove();
    // rectangles.exit().attr("class", "remove");
  };

  //set initial value
  update();

  //update every three seconds
  d3.interval(() => update(), 3000);
};
