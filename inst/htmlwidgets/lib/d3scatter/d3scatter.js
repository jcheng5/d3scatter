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
    var data = HTMLWidgets.dataframeToD3({x: props.x_var, y: props.y_var, color: props.color_var});
    var width = props.width - margin.left - margin.right;
    var height = props.height - margin.top - margin.bottom;
    outerSvg
        .cond(animate, "transition")
        .attr("width", props.width)
        .attr("height", props.height);
    svg
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.range([0, width]);
    if (props.x_lim)
      x.domain(props.x_lim);
    else
      x.domain(d3.extent(data, function(d) { return d.x; })).nice();

    y.range([height, 0]);
    if (props.y_lim)
      y.domain(props.y_lim);
    else
      y.domain(d3.extent(data, function(d) { return d.y; })).nice();

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
        .data(data);
    dots
      .enter().append("circle")
        .attr("cx", function(d) { return x(d.x); })
        .attr("cy", function(d) { return y(d.y); })
        .attr("class", "dot")
        .attr("r", 3.5);
    dots
      .exit()
        .remove();
    dots
        .classed("selected", function(d) {
          var ext = brush.extent();
          var selected =
            ext[0][0] <= d.x &&
            ext[1][0] >= d.x &&
            ext[0][1] <= d.y &&
            ext[1][1] >= d.y;
          return selected;
        })
        .cond(animate, "transition")
        .attr("cx", function(d) { return x(d.x); })
        .attr("cy", function(d) { return y(d.y); })
        .style("fill", function(d) {
          return color(d.color);
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
  property("x_var");
  property("x_label");
  property("x_lim");
  property("y_var");
  property("y_label");
  property("y_lim");
  property("color_var");

  brush.on("brush", function() {
    draw(false);
  });

  return draw;
}
