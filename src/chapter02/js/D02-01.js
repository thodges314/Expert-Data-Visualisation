const show = () => {
  // DEFINITIONS /////////////////////////////////
  let loadedData;
  const margin = { top: 20, bottom: 20, right: 20, left: 45 };
  const width = 700 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const chart = d3
    .select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const pieContainer = chart
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const arc = d3
    .arc()
    .outerRadius((height / 2) * 0.6)
    .innerRadius((height / 2) * 0.3);

  const labelsArc = d3
    .arc()
    .outerRadius((height / 2) * 0.7)
    .innerRadius((height / 2) * 0.7);

  const pie = d3
    .pie()
    .sort(null) // no sorting
    .padAngle(0.04)
    .value((d) => +d.count);

  const popupArc = d3
    .arc()
    .outerRadius((height / 2) * 0.65)
    .innerRadius((height / 2) * 0.3);

  // FILTERS ///////////////////////////////////
  const allFemaleFilter = (el) =>
    el.vetGroup === "001" &&
    el.ethnicGroup === "001" &&
    el.raceGroup === "00" &&
    el.sex === "002" &&
    el.yearsInBusiness !== "001";

  const allMaleFilter = (el) =>
    el.vetGroup === "001" &&
    el.ethnicGroup === "001" &&
    el.raceGroup === "00" &&
    el.sex === "003" &&
    el.yearsInBusiness !== "001";

  const allFirmsFilter = (el) =>
    el.vetGroup === "001" &&
    el.ethnicGroup === "001" &&
    el.raceGroup === "00" &&
    el.sex === "001" &&
    el.yearsInBusiness !== "001";

  const africanAmericanFilter = (el) =>
    el.vetGroup === "001" &&
    el.ethnicGroup === "001" &&
    el.raceGroup === "40" &&
    el.sex === "001" &&
    el.yearsInBusiness !== "001";

  const whiteFilter = (el) =>
    el.vetGroup === "001" &&
    el.ethnicGroup === "001" &&
    el.raceGroup === "30" &&
    el.sex === "001" &&
    el.yearsInBusiness !== "001";

  const filterData = (toShow) => {
    switch (toShow) {
      case "Female":
        return allFemaleFilter;
      case "Male":
        return allMaleFilter;
      case "All":
        return allFirmsFilter;
      case "AfricanAmerican":
        return africanAmericanFilter;
      case "White":
        return whiteFilter;
      default:
        return allFirmsFilter;
    }
  };

  // DRAW/UPDATE CIRCLE /////////////////////////
  const updateCircle = (toShow) => {
    // animations/tweens
    const getArcInterpolator = (el, d) => {
      // when we're interpolating, we need to interpolate
      // from the old value to the new one. We can keep track
      // of the old value in a global var, or bind it to the
      // element we're working on
      const oldValue = el._oldValue;
      const interpolator = d3.interpolate(
        {
          startAngle: oldValue ? oldValue.startAngle : 0,
          endAngle: oldValue ? oldValue.endAngle : 0,
        },
        d
      );
      // get the start value of the interpolator and bind that.
      // so we can use it for the next interpolator.
      el._oldValue = interpolator(0);

      return interpolator;
    };

    const tweenArcs = (d, i, nodes) => {
      const interpolator = getArcInterpolator(nodes[i], d);
      return (t) => arc(interpolator(t));
    };

    const tweenLabels = (d, i, nodes) => {
      const interpolator = getArcInterpolator(nodes[i], d);
      return (t) => {
        const p = labelsArc.centroid(interpolator(t));
        const xy = p;
        xy[0] = xy[0] * 1.2;
        return `translate(${xy})`;
      };
    };

    const tweenAnchor = (d, i, nodes) => {
      const interpolator = getArcInterpolator(nodes[i], d);
      return (t) => {
        const x = labelsArc.centroid(interpolator(t))[0];
        return x > 0 ? "start" : "end";
      };
    };

    const tweenLines = (d, i, nodes) => {
      const interpolator = getArcInterpolator(nodes[i], d);
      const lineGen = d3.line();
      return (t) => {
        const dInt = interpolator(t);
        const start = arc.centroid(dInt);
        const xy = labelsArc.centroid(dInt);
        const textXy = [xy[0], xy[1]];
        textXy[0] = textXy[0] * 1.15;
        return lineGen([start, xy, textXy]);
      };
    };

    // get data for all firms
    const filtered = loadedData.filter(filterData(toShow));
    const totalFirms = filtered.reduce((acc, cv) => acc + +cv.count, 0);

    // create arc segments (data property of arcs[i] represents data)
    const arcs = pie(filtered);

    // define elements (update)
    const arcElements = pieContainer.selectAll(".arc").data(arcs);
    const textElements = pieContainer.selectAll(".labels").data(arcs);
    const lineElements = pieContainer.selectAll(".lines").data(arcs);

    // append new elements
    arcElements
      .enter()
      .append("path")
      .attr("class", "arc")
      .style("fill", (d, i) => colors(i))
      .merge(arcElements)
      .on("mouseover", (evt, d) => {
        d3.select(evt.currentTarget).attr("d", (d) => popupArc(d));
        const centerText = pieContainer.selectAll(".center").data([d]);
        centerText
          .enter()
          .append("text")
          .attr("class", "center")
          .style("text-anchor", "middle")
          .merge(centerText)
          .text((d) => `${Math.round((+d.data.count / totalFirms) * 100)}%`);
      })
      .on("mouseout", (evt, d) => {
        d3.select(evt.currentTarget).attr("d", (d) => arc(d));
        pieContainer.selectAll(".center").text("");
      })
      .transition()
      // .ease(d3.easeCircle)
      // .ease(d3.easeElastic)
      // .ease(d3.easeBackOut)
      .ease(d3.easeBounce)
      .duration(2000)
      .attrTween("d", tweenArcs);

    textElements
      .enter()
      .append("text")
      .attr("class", "labels")
      .merge(textElements)
      .text((d) => `${d.data.yearsInBusinessLabel} (${d.data.count})`)
      .attr("dy", "0.35em")
      .transition()
      .ease(d3.easeBounce)
      .duration(2000)
      .attrTween("transform", tweenLabels)
      .styleTween("text-anchor", tweenAnchor);

    lineElements
      .enter()
      .append("path")
      .attr("class", "lines")
      .merge(lineElements)
      .transition()
      .ease(d3.easeBounce)
      .duration(2000)
      .attrTween("d", tweenLines);
  };

  d3.csv("./data/businessFiltered.csv", (row) => {
    switch (row.yearsInBusiness) {
      case "001":
        row.yearsInBusinessLabel = "All";
        break;
      case "311":
        row.yearsInBusinessLabel = "less then 2 years";
        break;
      case "318":
        row.yearsInBusinessLabel = "2 to 3 years ";
        break;
      case "319":
        row.yearsInBusinessLabel = "4 to 5 years";
        break;
      case "321":
        row.yearsInBusinessLabel = "6 to 10 years";
        break;
      case "322":
        row.yearsInBusinessLabel = "11 to 15 years";
        break;
      case "323":
        row.yearsInBusinessLabel = "more then 16 years";
        break;
    }
    return row;
  }).then((data) => {
    loadedData = data;
    updateCircle();
  });

  const colors = (i) => d3.interpolateReds(i / 6);

  // const arc = d3
  //   .arc()
  //   .outerRadius((height / 2) * 0.6)
  //   .innerRadius((height / 2) * 0.3);

  pieContainer
    .append("path")
    .attr("class", "backgroundArc")
    .attr("d", arc({ startAngle: 0, endAngle: 2 * Math.PI }));

  const update = () => {
    const toShow = select.property("selectedOptions")[0].value;
    updateCircle(toShow);
  };

  const select = d3.select("select").on("change", update);
};
