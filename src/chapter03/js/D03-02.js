const show = () => {
  // DEFINITIONS /////////////////////////////////
  let root;
  let currentRoot;

  const margin = { top: 20, bottom: 20, right: 120, left: 100 };
  const width = 800 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;

  const chartG = d3
    .select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${width / 2 + 100}, ${height / 2})`);

  // D3 MAPPING FUNCTIONS ///////////////////////
  const treeGen = d3
    .tree()
    .size([360, 300])
    .separation((a, b) => (a.parent === b.parent ? 1 : 2));

  // const stratify = d3.stratify();
  const colorScale = d3.scaleSequential(d3.interpolateSpectral).domain([0, 12]);

  // DRAWING TOOLS ////////////////////////////////
  const radialProject = ([x, y]) => {
    const angle = ((x - 90) / 180) * Math.PI;
    const radius = y;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  };
  const diagonal = (d) => {
    // console.log(d);
    const d0 = [d.x, d.y];
    const d1 = [d.parent.x, d.parent.y];
    const ymid = (d0[1] + d1[1]) / 2;
    const diagonalPath = d3.path();
    diagonalPath.moveTo(...radialProject(d0));
    diagonalPath.bezierCurveTo(
      ...radialProject([d0[0], ymid]),
      ...radialProject([d1[0], ymid]),
      ...radialProject(d1)
    );

    return diagonalPath.toString();
  };

  // DRAW EVERYTHING ///////////////////////////
  const update = () => {
    treeGen(currentRoot); // why is this not redundant?

    // draw lines
    chartG
      .selectAll(".link")
      .data(currentRoot.descendants().slice(1))
      .join(
        (enter) => {
          const links = enter.append("path").attr("class", "link");
          links
            .style("stroke", (d) => colorScale(d.data.group))
            .attr("d", diagonal({ x: 0, y: 0, parent: { x: 0, y: 0 } }))
            .transition()
            .duration(2000)
            .attr("d", diagonal);
          return links;
        },
        (update) =>
          update
            .transition()
            .duration(2000)
            .attr("d", diagonal) // possibly redundant
            .attr("transform", (d) => `translate(${d.y}, ${d.x})`)
      );

    // draw nodes/circles
    chartG
      .selectAll(".node")
      .data(currentRoot.descendants())
      .join(
        (enter) => {
          const nodes = enter.append("g").attr("class", "node");
          nodes
            .transition()
            .duration(2000)
            .attr(
              "transform",
              (d) => `translate(${radialProject([d.x, d.y])})`
            );
          nodes
            .append("circle")
            .attr("r", 2.5)
            .style("fill", (d) => colorScale(d.data.group));
          nodes
            .append("text")
            .attr("x", (d) => (d.x < 180 === !d.children ? 6 : -6))
            .text((d) => d.data.name)
            // we could also tween the anchor see chapter 2

            .style("text-anchor", (d) => {
              // for the right side
              if (d.x < 180 && d.children) return "end";
              else if (d.x < 180 && !d.children) return "start";
              // for the left side
              else if (d.x >= 180 && !d.children) return "end";
              else if (d.x >= 180 && d.children) return "start";
            })
            .transition()
            .duration(2000)
            .attr(
              "transform",
              (d) => `rotate(${d.x < 180 ? d.x - 90 : d.x + 90})`
            );
          return nodes;
        },
        (update) => {
          update
            .transition()
            .duration(2000)
            .attr(
              "transform",
              (d) => `translate(${radialProject([d.x, d.y])})`
            );
          update
            .selectAll("text")
            .transition()
            .duration(2000)
            .style("text-anchor", (d) => {
              // for the right side
              if (d.x < 180 && d.children) return "end";
              else if (d.x < 180 && !d.children) return "start";
              // for the left side
              else if (d.x >= 180 && !d.children) return "end";
              else if (d.x >= 180 && d.children) return "start";
            })
            // .transition()
            // .duration(2000)
            .attr(
              "transform",
              (d) => `rotate(${d.x < 180 ? d.x - 90 : d.x + 90})`
            );
          return update;
        }
      );

    // draw circles

    // draw text elements
  };

  // LOAD DATA /////////////////////////////////
  d3.csv("./data/cats.csv").then((data) => {
    root = d3.stratify()(data);

    treeGen(root);

    const colorGroups = root.descendants().filter((node) => node.depth === 2);
    colorGroups.forEach((group, i) =>
      group.descendants().forEach((node) => (node.data.group = i))
    );
    currentRoot = root.copy();
    update();
  });
};
