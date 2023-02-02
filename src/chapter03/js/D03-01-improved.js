const show = () => {
  // DEFINITIONS /////////////////////////////////
  const margin = { top: 20, bottom: 20, right: 120, left: 100 };
  const width = 1200 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;

  const chartG = d3
    .select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // MOVEMENT TOOLS //////////////////////////////
  const zoomed = (e) => chartG.attr("transform", e.transform);
  const zoom = d3.zoom().scaleExtent([0.1, 10]).on("zoom", zoomed);
  d3.select(".chart").call(zoom);

  // DRAWING TOOLS ////////////////////////////////
  const diagonal = (d) => {
    const d0 = [d.y, d.x];
    const d1 = [d.parent.y, d.parent.x];
    const xmid = (d0[0] + d1[0]) / 2;
    const diagonalPath = d3.path();
    diagonalPath.moveTo(...d0);
    diagonalPath.bezierCurveTo(xmid, d0[1], xmid, d1[1], ...d1);

    return diagonalPath.toString();
  };

  // LOAD DATA /////////////////////////////////
  d3.csv("./data/cats.csv").then((data) => {
    const rootData = d3.stratify()(data);

    const treeGen = d3
      .tree()
      .size([height * 2, width * 3])
      .separation((a, b) => (a.parent === b.parent ? 5 : 13));

    treeGen(rootData);

    // make links
    chartG
      .selectAll(".link")
      .data(rootData.descendants().slice(1))
      .join("path")
      .attr("class", "link")
      .attr("d", diagonal);

    //make nodes
    const nodeG = chartG
      .selectAll(".node")
      .data(rootData.descendants())
      .join("g")
      .attr(
        "class",
        (d) => `node ${d.children ? "node--internal" : "node--leaf"}`
      )
      .attr("transform", (d) => `translate(${d.y}, ${d.x})`);

    nodeG.append("circle").attr("r", 2.5);

    nodeG
      .append("text")
      .attr("dy", ".35em")
      .attr("x", (d) => (d.children ? -4 : 4))
      .style("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => d.data.name);
  });
};
