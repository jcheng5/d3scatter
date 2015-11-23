#' @import htmlwidgets
#' @import crosstalk
#' @export
d3scatter <- function(data, x_var, y_var, color_var,
  x_label = NULL, y_label = NULL,
  x_lim = NULL, y_lim = NULL,
  key = row.names(data),
  width = NULL, height = NULL) {

  resolve <- function(value) {
    if (inherits(value, "formula")) {
      eval(value[[2]], data, environment(value))
    } else {
      value
    }
  }

  if (x_label_missing <- missing(x_label)) {
    x_label <- deparse(substitute(x_var))
  }
  if (y_label_missing <- missing(y_label)) {
    y_label <- deparse(substitute(y_var))
  }

  if (inherits(x_var, "formula")) {
    if (x_label_missing) {
      x_label <- capture.output(print(x_var[[2]]))
    }
    x_var <- resolve(x_var)
  }
  if (inherits(y_var, "formula")) {
    if (y_label_missing) {
      y_label <- capture.output(print(y_var[[2]]))
    }
    y_var <- resolve(y_var)
  }
  color_var <- resolve(color_var)
  x_lim <- resolve(x_lim)
  y_lim <- resolve(y_lim)
  key <- resolve(key)

  # forward options using x
  x = list(
    x_var = x_var,
    y_var = y_var,
    color_var = color_var,
    x_label = x_label,
    y_label = y_label,
    x_lim = x_lim,
    y_lim = y_lim,
    key = key
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'd3scatter',
    x,
    width = width,
    height = height,
    package = 'd3scatter',
    dependencies = crosstalk::dependencies
  )
}

#' Shiny bindings for d3scatter
#'
#' Output and render functions for using d3scatter within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a d3scatter
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name d3scatter-shiny
#'
#' @export
d3scatterOutput <- function(outputId, width = '100%', height = '400px'){
  shinyWidgetOutput(outputId, 'd3scatter', width, height, package = 'd3scatter')
}

#' @rdname d3scatter-shiny
#' @export
renderD3scatter <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, d3scatterOutput, env, quoted = TRUE)
}
