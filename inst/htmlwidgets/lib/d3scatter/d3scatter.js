if (!d3.selection.prototype.cond) {
  d3.selection.prototype.cond = function(condition, method) {
    if (!condition) {
      return this;
    }
    var args = [];
    for (var i = 2; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    return this[method].apply(this, args);
  };
}

function d3scatter(container) {
  container = d3.select(container);
  var props = {};
  var margin = {top: 20, right: 20, bottom: 30, left: 40};

  var x = d3.scale.linear();

  var y = d3.scale.linear();

  var color = d3.scale.category10();

  var brush = d3.svg.brush()
      .x(x)
      .y(y);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var outerSvg = container.append("svg")
      .attr("class", "d3scatter");
  var svg = outerSvg.append("g");
  var xAxisNode = svg.append("g")
      .attr("class", "x axis");
  var yAxisNode = svg.append("g")
      .attr("class", "y axis");
  var xAxisLabel = xAxisNode.append("text")
      .attr("class", "label")
      .attr("y", -6)
      .style("text-anchor", "end");
  var yAxisLabel = yAxisNode.append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");

  function draw(animate) {
    var width = props.width - margin.left - margin.right;
    var height = props.height - margin.top - margin.bottom;
    outerSvg
        .cond(animate, "transition")
        .attr("width", props.width)
        .attr("height", props.height);
    svg
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x
        .range([0, width])
        .domain(d3.extent(props.data, function(d) { return d[props.x_var]; })).nice();
    y
        .range([height, 0])
        .domain(d3.extent(props.data, function(d) { return d[props.y_var]; })).nice();

    xAxisNode
        .cond(animate, "transition")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    xAxisLabel
        .cond(animate, "transition")
        .attr("x", width)
        .text(props.x_label);

    yAxisNode
        .cond(animate, "transition")
        .call(yAxis);
    yAxisLabel
        .text(props.y_label);

    svg.classed("selection-active", function() {
      return !brush.empty();
    });

    var dots = svg.selectAll(".dot")
        .data(props.data);
    dots
      .enter().append("circle")
        .attr("cx", function(d) { return x(d[props.x_var]); })
        .attr("cy", function(d) { return y(d[props.y_var]); })
        .attr("class", "dot")
        .attr("r", 3.5);
    dots
      .exit()
        .remove();
    dots
        .classed("selected", function(d) {
          var ext = brush.extent();
          var selected =
            ext[0][0] <= d[props.x_var] &&
            ext[1][0] >= d[props.x_var] &&
            ext[0][1] <= d[props.y_var] &&
            ext[1][1] >= d[props.y_var];
          return selected;
        })
        .cond(animate, "transition")
        .attr("cx", function(d) { return x(d[props.x_var]); })
        .attr("cy", function(d) { return y(d[props.y_var]); })
        .style("fill", function(d) {
          return color(d[props.color_var]);
        });

    var legend = svg.selectAll(".legend")
        .data(color.domain());
    var legendNew = legend.enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legendNew.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18);

    legendNew.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end");

    legend.exit().remove();

    legend.selectAll("rect")
        .cond(animate, "transition")
        .attr("x", width - 18)
        .style("fill", color);
    legend.selectAll("text")
        .cond(animate, "transition")
        .attr("x", width - 24)
        .text(function(d) { return d; });

    svg.call(brush);
  }

  function property(name) {
    draw[name] = function(value) {
      if (!arguments.length) return props[name];
      props[name] = value;
      return draw;
    };
  }

  property("width");
  property("height");
  property("data");
  property("x_var");
  property("x_label");
  property("y_var");
  property("y_label");
  property("color_var");

  brush.on("brush", function() {
    draw(false);
  });

  return draw;
}
