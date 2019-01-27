!(function (d3) {

$("econtent").empty();

d3.select("econtent").append("h2").text("Comparison of Four Stocks from April 2017 to April 2018");


  var svg = d3.select("econtent").append("svg")
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x0 = d3.scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.05);

  var x1 = d3.scaleBand()
  .padding(0.05);

  var y = d3.scaleLinear()
  .rangeRound([height, 0]);

  var z = d3.scaleOrdinal()
  .range(["#98abc5", "#a05d56", "#d0743c", "#ff8c00"]);

  d3.csv('stocks.csv', (error, data) => {

    if (error) throw error;

    // Nest stock values by symbol.
    var dataByYear = d3.nest()
        .key(d => { return d.date; })
        .key(d => { return d.symbol; })
        .rollup(v => {
          return d3.sum(v, d => { return d.price; });
        })
        .entries(data);

	  dataByYear.forEach( y => {

      y.year = y.key;
      delete y.key;

      y.values.forEach(d => {
        d.symbol = d.key;
        d.sum_price = +d.value;
        delete d.key;
        delete d.value;
      });

      y.values.sort( (a, b) => {
        return b.sum_price - a.sum_price;
      });

    });

    let symbolList = dataByYear[0].values.map(d => { return d.symbol; });
    let yearList = dataByYear.map(d => { return d.year; });

    x0.domain(yearList);
    x1.domain(symbolList).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(dataByYear, d => {return d3.max(d.values, el => { return el.sum_price; }); })]).nice();
    z.domain(symbolList);

    var year = g.append("g")
    .selectAll("g")
    .data(dataByYear)
    .enter().append("g")
    .attr("transform", d => { return "translate(" + x0(d.year) + ",0)"; })

    var rect = year.selectAll("rect")
    .data( d => { return d.values; })
    .enter().append("rect")
    .attr("y", height)
    .attr("width", x0.bandwidth())
    .attr("height", 0);

    let drawGroupedBars = () => {
      rect.transition()
      .duration(500)
      .delay( (d, i) => { return i * 10; })
      .attr("x", d => { return x1(d.symbol); })
      .attr("y", d => { return y(d.sum_price); })
      .attr("width", x1.bandwidth())
      .attr("height", d => { return height - y(d.sum_price); })
      .attr("fill", d => { return z(d.symbol); });
    }

    let drawAxis = () => {
      g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));

      g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
      .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Price");
    }

    let drawLegend = (data) => {
      var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(data)
      .enter().append("g")
      .attr("transform", (d, i) => { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

      legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text( d => { return d; });
    }

    drawGroupedBars();
    drawAxis();
    drawLegend(symbolList);

    d3.selectAll("input").on("change", change);

    var timeout = setTimeout( () => {
      d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
    }, 17);

    function change() {
      clearTimeout(timeout);
      if (this.value === "grouped") transitionGrouped();
      else transitionStacked();
    }

    function transitionGrouped() {

      rect.transition()
      .duration(500)
      .delay( (d, i) => { return i * 10; })
      .attr("x", d => { return x1(d.symbol); })
      .attr("width", x1.bandwidth())
      .transition()
      .attr("y", d => { return y(d.sum_price); })
      .attr("height", d => { return height - y(d.sum_price); });
    }

    function transitionStacked() {

      rect.transition()
      .duration(500)
      .delay( (d, i) => { return i * 10; })
      .attr("y", d => { return y(d.sum_price); })
      .attr("height", d => { return height - y(d.sum_price); })
      .transition()
      .attr("x", d => { return x0(d.symbol); })
      .attr("width", x0.bandwidth());
    }

  });

  	})(d3);