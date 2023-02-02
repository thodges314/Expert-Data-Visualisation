const show = () => {
  // DEFINITIONS /////////////////////////////////
  // let loadedData;
  const margin = { top: 20, bottom: 20, right: 120, left: 100 };
  const width = 1200 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;

  const chartG = d3
    .select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
};
