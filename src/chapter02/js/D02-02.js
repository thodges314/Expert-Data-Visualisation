const show = () => {
  // DEFINITIONS ///////////////////////////////////////////
  const yearMax = 2014;
  let adjustedData;
  let unadjustedData;

  const margin = { top: 20, bottom: 20, right: 50, left: 20 },
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const chart = d3
    .select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // HANDLE MOUSE //////////////////////////////////////////
  const mousemove =
    (
      xScale,
      yIndexedScale,
      yIncomeScale,
      adjustedIndexedData,
      unadjustedCleaned,
      focusG
    ) =>
    (event) => {
      const x0 = xScale.invert(d3.pointer(event)[0]);
      const xToShow = Math.round(x0);
      const dAdjusted = adjustedIndexedData[xToShow - 1984];
      const dIncome = unadjustedCleaned[xToShow - 1984];
      const xPos = xScale(xToShow);
      const yIncomePos = yIncomeScale(dIncome.value);
      const yIndexPos = yIndexedScale(dAdjusted.indexed);

      focusG
        .select("#indexCircle")
        .attr("transform", `translate(${xPos}, ${yIndexPos})`);
      focusG
        .select("#incomeCircle")
        .attr("transform", `translate(${xPos}, ${yIncomePos})`);
      focusG.select(".verLine").attr("transform", `translate(${xPos}, 0)`);

      const textOffset = yIncomePos < yIndexPos ? 5 : -5;

      focusG
        .select("#indexText")
        .attr(
          "transform",
          `translate(${xPos}, ${yIndexedScale(dAdjusted.indexed) + textOffset})`
        )
        .text(Math.round(((dAdjusted.indexed - 100) * 100) / 100));
      focusG
        .select("#incomeText")
        .attr(
          "transform",
          `translate(${xPos}, ${yIncomeScale(dIncome.value) - textOffset})`
        )
        .text(`$ ${dIncome.value}`);
    };

  // DRAWING TOOLS ///////////////////////////////////////////
  const addGradients = (yIndexed) => {
    const rangeMax = yIndexed.invert(0);
    const rangeMin = yIndexed.invert(height);
    chart
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", yIndexed(rangeMax))
      .attr("x2", 0)
      .attr("y2", yIndexed(rangeMin))
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#e5f2d7" },
        { offset: "50%", color: "#eee" },
        { offset: "100%", color: "#efdbe3" },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    chart
      .append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", yIndexed(rangeMax))
      .attr("x2", 0)
      .attr("y2", yIndexed(rangeMin))
      .selectAll("stop")
      .data([
        { offset: "0", color: "#97D755" },
        { offset: "0.5", color: "#97D755" },
        { offset: "0.5", color: "#CD94AB" },
        { offset: "1", color: "#CD94AB" },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);
  };

  const addArea = (xScale, yIndexedScale, adjustedIndexedData) => {
    const areaAdjusted = d3
      .area()
      .x1((d) => xScale(d.date))
      .y1((d) => yIndexedScale(d.indexed))
      .x0((d) => xScale(d.date))
      .y0(() => yIndexedScale(100))
      .curve(d3.curveCatmullRom.alpha(0.5));
    chart
      .append("path")
      .attr("d", areaAdjusted(adjustedIndexedData))
      .style("fill", "url(#area-gradient");
  };

  const addIndexedLine = (xScale, yIndexedScale, adjustedIndexedData) => {
    const lineAdjusted = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yIndexedScale(d.indexed))
      .curve(d3.curveCatmullRom.alpha(0.5));

    chart
      .append("path")
      .attr("d", lineAdjusted(adjustedIndexedData))
      .style("fill", "none")
      .style("stroke", "url(#line-gradient)")
      .style("stroke-width", "2");
  };
  const addIncomeLine = (xScale, yIncomeScale, unadjustedCleaned) => {
    const lineIncome = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yIncomeScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    chart
      .append("path")
      .attr("d", lineIncome(unadjustedCleaned))
      .style("fill", "none")
      .style("stroke", "steelblue")
      .style("stroke-width", "2");
  };
  const addAxis = (yIncomeScale, yIndexedScale, xScale, xRangeAdjusted) => {
    //bottom Axis
    const bottomAxis = d3.axisBottom().scale(xScale).ticks(15, "f");
    const bottomAxisG = chart
      .append("g")
      .attr("transform", `translate(0, ${yIndexedScale(100)})`)
      .call(bottomAxis);

    bottomAxisG
      .selectAll("text")
      .attr("transform", "translate(-16, 14) rotate(-70)");

    //right Axis
    const rightAxis = d3.axisRight().scale(yIncomeScale).ticks(20);
    chart
      .append("g")
      .attr("transform", `translate(${width + 4})`)
      .call(rightAxis);

    //left Axis
    const leftAxisSteps = d3.range(
      100 - xRangeAdjusted,
      100 + xRangeAdjusted + 1,
      2
    );
    const leftAxis = d3
      .axisLeft()
      .scale(yIndexedScale)
      .tickValues(leftAxisSteps);
    const leftAxisG = chart
      .append("g")
      .attr(
        "transform",
        `translate(0, ${+yIndexedScale(100 + xRangeAdjusted)})`
      )
      .call(leftAxis);
    leftAxisG
      .selectAll("text")
      .text((d) => (d === 100 ? "no change" : d3.format("+")(d - 100)))
      .attr("stroke", "#aaa")
      .attr("dy", "-0.5em")
      .attr("dx", "1em")
      .style("font-weight", "100")
      .attr("text-anchor", "start");
    leftAxisG.selectAll(".domain").remove();
    leftAxisG
      .selectAll(".tick line")
      .attr("x1", width)
      .attr("stroke", "#ddd")
      .attr("opacity", "0.6");
  };
  const addMouseTracker = (
    xScale,
    yIndexedScale,
    yIncomeScale,
    adjustedIndexedData,
    unadjustedCleaned
  ) => {
    // focus element (gets repositioned)
    const focusG = chart
      .append("g")
      .attr("class", "focus")
      .style("display", "none");
    focusG.append("circle").attr("id", "indexCircle").attr("r", 4.5);
    focusG.append("circle").attr("id", "incomeCircle").attr("r", 4.5);
    focusG
      .append("text")
      .attr("id", "indexText")
      .attr("x", 9)
      .attr("dy", ".35em");
    focusG
      .append("text")
      .attr("id", "incomeText")
      .attr("x", 9)
      .attr("dy", ".35em");
    const verticalLineP = d3.line()([
      [0, -10],
      [0, height + 10],
    ]);
    focusG
      .append("path")
      .attr("d", verticalLineP)
      .attr("class", "verLine")
      .attr("stroke", "grey")
      .attr("stroke-dasharray", "6,6")
      .attr("stroke-width", "1");
    chart
      .append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", () => focusG.style("display", null))
      .on("mouseout", () => focusG.style("display", "none"))
      .on(
        "mousemove",
        mousemove(
          xScale,
          yIndexedScale,
          yIncomeScale,
          adjustedIndexedData,
          unadjustedCleaned,
          focusG
        )
      );
  };

  // DRAW/UPDATE GRAPHS ///////////////////////////////////////
  const mapToIndexed = (row, refRow) => {
    const income = +row.MEHOINUSA672N;
    const reference = +refRow.MEHOINUSA672N;
    return {
      date: row.DATE.split("-")[0],
      indexed: (income / reference) * 100,
    };
  };

  const mapToIncome = (row) => {
    const income = +row.MEHOINUSA646N;
    return { date: row.DATE.split("-")[0], value: income };
  };

  const update = (year) => {
    // adjusted (relative)
    year = year || yearMax;
    const yearIndex = adjustedData.length - 1 - (yearMax - year);
    const adjustedIndexedData = adjustedData.map((d) =>
      mapToIndexed(d, adjustedData[yearIndex])
    );

    const maxAbove = Math.abs(
      100 - d3.max(adjustedIndexedData, (d) => d.indexed)
    );
    const maxBelow = Math.abs(
      100 - d3.min(adjustedIndexedData, (d) => d.indexed)
    );
    const xRangeAdjusted = Math.ceil(Math.max(maxAbove, maxBelow));
    const xScale = d3.scaleLinear().range([0, width]).domain([1984, 2014]);
    const yIndexedScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([100 - xRangeAdjusted, 100 + xRangeAdjusted]);

    // unadjusted (absolute)
    const unadjustedCleaned = unadjustedData.map(mapToIncome);
    const incomeMin = d3.min(unadjustedCleaned, (d) => d.value);
    const incomeMax = d3.max(unadjustedCleaned, (d) => d.value);
    const yIncomeScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        Math.floor(incomeMin / 2000) * 2000,
        Math.ceil(incomeMax / 2000) * 2000,
      ]);

    // add stuff to graph
    addGradients(yIndexedScale);
    addArea(xScale, yIndexedScale, adjustedIndexedData);
    addIndexedLine(xScale, yIndexedScale, adjustedIndexedData);
    addIncomeLine(xScale, yIncomeScale, unadjustedCleaned);
    addAxis(yIncomeScale, yIndexedScale, xScale, xRangeAdjusted);
    addMouseTracker(
      xScale,
      yIndexedScale,
      yIncomeScale,
      adjustedIndexedData,
      unadjustedCleaned
    );
  };

  // LOAD DATA ///////////////////////////////////////////////
  const files = ["./data/households.csv", "./data/householdsU.csv"];

  Promise.all(files.map((url) => d3.csv(url))).then((values) => {
    adjustedData = values[0];
    unadjustedData = values[1];
    update();
  });
};
