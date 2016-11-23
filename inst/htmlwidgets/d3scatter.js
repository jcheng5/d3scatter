HTMLWidgets.widget({

  name: 'd3scatter',

  type: 'output',

  factory: function(el, width, height) {

    var firstRun = true;
    var scatter = d3scatter(el).width(width).height(height);

    var sel_handle = new crosstalk.SelectionHandle();
    var filter_handle = new crosstalk.FilterHandle();

    sel_handle.on("change", function(e) {
      if (e.sender !== sel_handle) {
        scatter.clearBrush();
      }
      scatter.selection(e.value);
    });
    filter_handle.on("change", function(e) {
      scatter.filter(e.value);
    });

    return {
      renderValue: function(value) {
        scatter
          .x_var(value.x_var)
          .y_var(value.y_var)
          .color_var(value.color_var)
          .color_spec(value.color_spec)
          .x_label(value.x_label)
          .y_label(value.y_label)
          .x_lim(value.x_lim)
          .y_lim(value.y_lim)
          .key(value.key);

        scatter.on("brush", function(keys) {
          sel_handle.set(keys);
        });

        sel_handle.setGroup(value.group);
        filter_handle.setGroup(value.group);

        scatter(!firstRun);
        firstRun = false;
      },
      resize: function(width, height) {
        scatter.width(width).height(height)(false);
      }
    };
  }
});
