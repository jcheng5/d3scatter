HTMLWidgets.widget({

  name: 'd3scatter',

  type: 'output',

  initialize: function(el, width, height) {

    var scatter = d3scatter(el)
        .width(width)
        .height(height);
    return {
      firstRun: true,
      scatter: scatter
    };

  },

  renderValue: function(el, x, instance) {
    instance.scatter
        .width(el.offsetWidth)
        .height(el.offsetHeight)
        .x_var(x.x_var)
        .y_var(x.y_var)
        .color_var(x.color_var)
        .x_label(x.x_label)
        .y_label(x.y_label)
        .x_lim(x.x_lim)
        .y_lim(x.y_lim)
        .key(x.key)
        (!instance.firstRun);

    instance.firstRun = false;
  },

  resize: function(el, width, height, instance) {
    instance.scatter
        .width(width)
        .height(height)
        (false);
  }

});
