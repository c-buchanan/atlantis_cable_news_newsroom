// D3 Animated Scatter Plot
// ===========================
// Using D3, create a scatter plot that represents each state with circle elements. 
// You need to create a scatter plot between two of the data variables 
// such as `Healthcare vs. Poverty` or `Smokers vs. Age`.
// ===========================
// Include state abbreviations in the circles.
// Create and situate your axes and labels to the left and bottom of the chart.
// Note: You'll need to use `python -m http.server` to run the visualization. 
// This will host the page at `localhost:8000` in your web browser.

// Section 1: Pre-Data Setup
// ===========================
// Set up the width, height and margins of the graph.

// Grab the width of the containing box
var width = parseInt(d3.select("#scatter").style("width"));

// Designate the height of the graph
var height = width - width / 3.9;

// Margin spacing for graph
var margin = 20;

// space for placing words
var labelArea = 110;

// padding for the text at the bottom and left axes
var textPadBot = 40;
var textPadLeft = 40;

// Create the canvas for the graph
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Set the radius for each dot that will appear in the graph.

var circRadius;
function crGet() {
  if (width <= 530) {
    circRadius = 5;
  }
  else {
    circRadius = 10;
  }
}
crGet();

// The Labels for our Axes

// A) Bottom Axis
// ==============

// We create a group element to nest our bottom axes labels.
svg.append("g").attr("class", "xText");
// xText will allows us to select the group without excess code.
var xText = d3.select(".xText");

// We give xText a transform property that places it at the bottom of the chart.
// By nesting this attribute in a function, we can easily change the location of the label group
// whenever the width of the window changes.
function xTextRefresh() {
  xText.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) +
      ", " +
      (height - margin - textPadBot) +
      ")"
  );
}
xTextRefresh();

// Now we use xText to append three text SVG files, with y coordinates specified to space out the values.
// 1. Poverty
xText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");
// 2. Age
xText
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");
// 3. Income
xText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

// B) Left Axis
// ============

// Specifying the variables like this allows us to make our transform attributes more readable.
var leftTextX = margin + textPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

// We add a second label group, this time for the axis left of the chart.
svg.append("g").attr("class", "yText");

// yText will allows us to select the group without excess code.
var yText = d3.select(".yText");

function yTextRefresh() {
  yText.attr(
    "transform",
    "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
  );
}
yTextRefresh();

// APPEND THE TEXT

// 1. Obesity
yText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

// 2. Smokes
yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

// 3. Lacks Healthcare
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

// 2. Importing the Data
// ========================
// 150 lines into the code, and we're just importing the data. Oh boy.
// Import the csv using d3 
d3.csv("assets/data/data.csv").then(function(data) {
    visualize(data);
  });

// 3. Visualization Function in D3
// ====================================
// It's just like in R..... except everything is different. 

function visualize(data) {
    // Set the local variables
    var dataX = "poverty";
    var dataY = "obesity";
  
    // Create empty variables for min and max values of x and y. 
    var xMin;
    var xMax;
    var yMin;
    var yMax;
  
    // A function within a function because that's how tooltips work in D3.
    // Documentation diving, go!
    var toolTip = d3
      .tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {
        var xKey;
        // Grab the state name.
        var stateName = "<div>" + d.state + "</div>";
        // Snatch the y value's key and value.
        var yKey = "<div>" + dataY + ": " + d[dataY] + "%</div>";
        // If the x key is poverty
        if (dataX === "poverty") {
          // then grab the x key and value formatted as a percentage
          xKey = "<div>" + dataX + ": " + d[dataX] + "%</div>";
        }
        else {
          // Otherwise
          // Grab the x key and a version of the value formatted to include commas after every third digit.
          xKey = "<div>" +
            dataX +
            ": " +
            parseFloat(d[dataX]).toLocaleString("en") +
            "</div>";
        }
        // Display what we captured and please, please work. 
        return stateName + xKey + yKey;
      });
    // Call the toolTip function.
    svg.call(toolTip);
    }

      // Part 3: Instantiate the Scatter Plot
  // ====================================
  // This will add the first placement of our data and axes to the scatter plot.

  // First grab the min and max values of x and y.
  xMinMax();
  yMinMax();

  // With the min and max values now defined, we can create our scales.
  // Notice in the range method how we include the margin and word area.
  // This tells d3 to place our circles in an area starting after the margin and word area.
  var xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);
  var yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    // Height is inverses due to how d3 calc's y-axis placement
    .range([height - margin - labelArea, margin]);

  // We pass the scales into the axis methods to create the axes.
  // Note: D3 4.0 made this a lot less cumbersome then before. Kudos to mbostock.
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // Determine x and y tick counts.
  // Note: Saved as a function for easy mobile updates.
  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();

  // We append the axes in group elements. By calling them, we include
  // all of the numbers, borders and ticks.
  // The transform attribute specifies where to place the axes.
  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  // Now let's make a grouping for our dots and their labels.
  var circlecircleDotDot = svg.selectAll("g circlecircleDotDot").data(data).enter();

  // We append the circles for each row of data (or each state, in this case).
  circlecircleDotDot
    .append("circle")
    // These attributes specify location, size and class.
    .attr("cx", function(d) {
      return xScale(d[dataX]);
    })
    .attr("cy", function(d) {
      return yScale(d[dataY]);
    })
    .attr("r", circRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    // Hover rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d, this);
      // Highlight the state circle's border
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove the tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select(this).style("stroke", "#e3e3e3");
    });

  // With the circles on our graph, we need matching labels.
  // Let's grab the state abbreviations from our data
  // and place them in the center of our dots.
  circlecircleDotDot
    .append("text")
    // We return the abbreviation to .text, which makes the text the abbreviation.
    .text(function(d) {
      return d.abbr;
    })
    // Now place the text using our scale.
    .attr("dx", function(d) {
      return xScale(d[dataX]);
    })
    .attr("dy", function(d) {
      // When the size of the text is the radius,
      // adding a third of the radius to the height
      // pushes it into the middle of the circle.
      return yScale(d[dataY]) + circRadius / 2.5;
    })
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    // Hover Rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d);
      // Highlight the state circle's border
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  // Part 3: Create the Scatter Plot
  // ====================================
  // Place the data and axes on the scatter plot. 

  xMinMax();
  yMinMax();

    // Create the scales.
    var xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);
  var yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([height - margin - labelArea, margin]);

  // We pass the scales into the axis methods to create the axes.
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // Determine x and y tick counts.
  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();

  // We append the axes in group elements. 
  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  // Make a grouping for our dots and their labels.
  var circlecircleDotDot = svg.selectAll("g circlecircleDotDot").data(data).enter();

  // Append the circles for each state (row).
  // Is this where I messed up? The circles aren't showing. 
  circlecircleDotDot
    .append("circle")
    // Specify location, size, and class
    .attr("cx", function(d) {
      return xScale(d[dataX]);
    })
    .attr("cy", function(d) {
      return yScale(d[dataY]);
    })
    .attr("r", circRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    // Hover rules so it's vaguely interactive 
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d, this);
      // Highlight the state circle's border
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove the tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select(this).style("stroke", "#e3e3e3");
    });

  // Create matching labels. 
  circlecircleDotDot
    .append("text")
    // Return the abbreviation to .text, which makes the text the abbreviation.
    .text(function(d) {
      return d.abbr;
    })
    // Place the text using our scale.
    .attr("dx", function(d) {
      return xScale(d[dataX]);
    })
    .attr("dy", function(d) {
      return yScale(d[dataY]) + circRadius / 2.5;
    })
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    // Hover Rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d);
      // Highlight the state circle's border
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

// At this point, stare at your D3 code and wonder why it hates you
// At least the axis showed up correctly.

  // Part 4: Make the Graph Dynamic and Animated
  // ==========================

  // Select all axis text and add this d3 click event.
  d3.selectAll(".aText").on("click", function() {
    var self = d3.select(this);
    if (self.classed("inactive")) {
      // Grab the name and axis saved in label.
      var axis = self.attr("data-axis");
      var name = self.attr("data-name");

      // When x is the saved axis, execute this:
      if (axis === "x") {
        // Make dataX the same as the data name.
        dataX = name;

        // Change the min and max of the x-axis
        xMinMax();

        // Update the domain of x.
        xScale.domain([xMin, xMax]);

        // Now use a transition when we update the xAxis.
        // Please animate. 
        svg.select(".xAxis").transition().duration(300).call(xAxis);

        // Update the location of the state circles.
        d3.selectAll("circle").each(function() {
          // Each state circle gets a transition for its new attribute.
          d3
            .select(this)
            .transition()
            .attr("cx", function(d) {
              return xScale(d[dataX]);
            })
            .duration(300);
        });

        // Change the location of the state texts, too.
        d3.selectAll(".stateText").each(function() {
          // Give each state text the same motion as the matching circle.
          d3
            .select(this)
            .transition()
            .attr("dx", function(d) {
              return xScale(d[dataX]);
            })
            .duration(300);
        });

        // Change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
      else {
        // When y is the saved axis, execute this:
        // Make dataY the same as the data name.
        dataY = name;

        // Change the min and max of the y-axis.
        yMinMax();

        // Update the domain of Y.
        yScale.domain([yMin, yMax]);

        // Update Y Axis
        svg.select(".yAxis").transition().duration(300).call(yAxis);

        // Update the location of the state circles.
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cy", function(d) {
              return yScale(d[dataY]);
            })
            .duration(300);
        });

        // Change the location of the state texts
        d3.selectAll(".stateText").each(function() {
          // Give each state text the same motion tween as the matching circle.
          d3
            .select(this)
            .transition()
            .attr("dy", function(d) {
              return yScale(d[dataY]) + circRadius / 3;
            })
            .duration(300);
        });

        // Change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
    }
  });