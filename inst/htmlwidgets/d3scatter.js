HTMLWidgets.widget({

  name: 'd3scatter',

  type: 'output',

  factory: function(el, width, height) {

    var firstRun = true;
    var scatter = d3scatter(el).width(width).height(height);

    var ct_selection = null;
    var ct_filter = null;

    scatter.on("brush", function(keys) {
      if (ct_selection) {
        ct_selection.set(keys);
      }
    });

    return {
      renderValue: function(value) {

        if (ct_selection) {
          ct_selection.close();
          ct_selection = null;
        }
        if (ct_filter) {
          ct_filter.close();
          ct_filter = null;
        }

        if (value.group) {
          ct_selection = new crosstalk.SelectionHandle(value.group);
          ct_selection.on("change", function(e) {
            if (e.sender !== ct_selection) {
              scatter.clearBrush();
            }
            scatter.selection(e.value);
          });

          ct_filter = new crosstalk.FilterHandle(value.group);
          ct_filter.on("change", function(e) {
            scatter.filter(e.value);
          });
        }

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

        scatter(!firstRun);
        firstRun = false;
      },
      resize: function(width, height) {
        scatter.width(width).height(height)(false);
      }
    };
  }
});
