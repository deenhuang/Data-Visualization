!(function (d3) {

$("dcontent").empty();

d3.select("dcontent").append("h2").text("Opening Market Prices VS. Closing Market Prices of GoPro");

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: -100, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%m/%d/%Y");

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the line
    var valueline = d3.line()
        .x(function(d) { return x(d.Date); })
        .y(function(d) { return y(d.Close); });

    // define the line 2
    var valueline2 = d3.line()
        .x(function(d) { return x(d.Date); })
        .y(function(d) { return y(d.Open); });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("dcontent").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.csv("GPRO.csv", function(error,data) {
      if (error) throw error;
      // format the data
      data.forEach(function(d) {
          d.Date = parseTime(d.Date);
          d.Close =+ d.Close;
          d.Open =+ d.Open;
      });

      // Scale the range of the data
      x.domain(d3.extent(data, function(d) { return d.Date; }));
      y.domain([0, d3.max(data, function(d) { return d.Close; })]);

      // Add the valueline path.
      svg.append("path")
          .data([data])
          .attr("class", "line")
          .attr("stroke", "steelblue")
          .attr("d", valueline);

      svg.append("text")
          .attr("transform", "translate("+(width+1)+","+y(data[data.length-30].Close)+")")
          .attr("text-anchor", "middle")
          .style("fill", "steelblue")
          .attr("font-size","15")
          .text("Close");

      // Add the valueline path 2.
      svg.append("path")
          .data([data])
          .attr("class", "line")
          .attr("stroke", "red")
          .attr("d", valueline2);

      svg.append("text")
          .attr("transform", "translate("+(width+1)+","+y(data[data.length-10].Open)+")")
          .attr("text-anchor", "start")
          .style("fill", "red")                      
          .attr("font-size","15")
          .text("Open");
          
      // Add the scatterplot
      svg.selectAll("dot")
          .data(data)
        .enter().append("circle")
          .filter(function(d) { return d.Close == 6.56 || d.Close == 11.18})  // <== This line
          .style("fill", "black")                          // <== and this one
          .attr("r", 5)
          .attr("cx", function(d) { return x(d.Date); })
          .attr("cy", function(d) { return y(d.Close); });

      // Add the X Axis
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      // text label for the x axis
      svg.append("text")             
          .attr("transform","translate(" + (width/2) + " ," + (height + margin.top + 20) + ")")
          .style("text-anchor", "middle")
          .text("Date")
          .attr("font-size",15);

      // Add the Y Axis
      svg.append("g")
          .call(d3.axisLeft(y));

      svg.append("text")
          .attr("text-anchor", "middle")  // this makes it easy to centre the text as the 
          .attr("transform", "translate(-35,"+(height/2)+")rotate(-90)") 
          .text("Price")
          .attr("font-size",15);

    });

      })(d3);