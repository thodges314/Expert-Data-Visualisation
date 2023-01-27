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
      .attr("id", "area-gradient")
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
    const area = d3
      .area()
      .x1((d) => xScale(d.date))
      .y1((d) => yIndexedScale(d.indexed))
      .x0((d) => xScale(d.date))
      .y0((d) => yIndexedScale(100))
      .curve(d3.curveCatmullRom.alpha(0.5));
    chart
      .append("path")
      .attr("d", area(adjustedIndexedData))
      .attr("fill", "url(#area-gradient");
  };
  const addIndexedLine = (xScale, yIndexedScale, adjustedIndexedData) => {};
  const addIncomeLine = (xScale, yIncomeScale, unadjustedCleaned) => {};
  const addAxis = (yIncomeScale, yIndexedScale, xScale, xRangeAdjusted) => {};
  const addMouseTracker = (
    xScale,
    yIndexedScale,
    yIncomeScale,
    adjustedIndexedData,
    unadjustedCleaned
  ) => {};

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
    year = year || yearMax;
    const yearIndex = adjustedData.length - 1 - (yearMax - year);
    const adjustedIndexedData = adjustedData.map((d) =>
      mapToIndexed(d, adjustedData[yearIndex])
    );
    const unadjustedCleaned = unadjustedData.map(mapToIncome);

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
    const incomeMin = d3.min(unadjustedCleaned, (d) => d.value);
    const incomeMax = d3.max(unadjustedCleaned, (d) => d.value);
    const yIncomeScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        Math.floor(incomeMin / 2000) * 2000,
        Math.ceil(incomeMax / 2000) * 2000,
      ]);
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
