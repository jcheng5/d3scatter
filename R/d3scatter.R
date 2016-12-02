#' Create a scatter plot
#'
#' @param data A data frame or \link[crosstalk]{SharedData} object
#' @param x One-sided formula indicating the column or expression for x values
#' @param y One-sided formula indicating the column or expression for y values
#' @param color One-sided formula indicating the column or expression for color
#'   values
#' @param x_label,y_label Labels for axes
#' @param x_lim,y_lim Two-element numeric vectors indicating the limits for axes
#' @param width,height Override default size (see
#'   \link[htmltools]{validateCssUnit})
#'
#' @examples
#' d3scatter(iris, ~Sepal.Width, ~Sepal.Length, color = ~Species)
#'
#' @import htmlwidgets
#' @import crosstalk
#' @export
d3scatter <- function(data, x, y, color = NULL,
  x_label = NULL, y_label = NULL,
  x_lim = NULL, y_lim = NULL,
  width = NULL, height = NULL) {

  if (is.SharedData(data)) {
    key <- data$key()
    group <- data$groupName()
    data <- data$origData()
  } else {
    key <- NULL
    group <- NULL
  }

  resolve <- function(value) {
    if (inherits(value, "formula")) {
      eval(value[[2]], data, environment(value))
    } else {
      value
    }
  }

  if (x_label_missing <- missing(x_label)) {
    x_label <- deparse(substitute(x))
  }
  if (y_label_missing <- missing(y_label)) {
    y_label <- deparse(substitute(y))
  }

  if (inherits(x, "formula")) {
    if (x_label_missing) {
      x_label <- lazyeval::f_text(x)
    }
    x <- resolve(x)
  }
  if (inherits(y, "formula")) {
    if (y_label_missing) {
      y_label <- lazyeval::f_text(y)
    }
    y <- resolve(y)
  }
  color <- resolve(color)
  color_spec <- if (is.numeric(color)) {
    list(type = "linear", range = range(color))
  } else if (is.factor(color)) {
    list(type = "ordinal", values = levels(color))
  } else if (is.null(color)) {
    list(type = "constant", value = "#333333")
  } else if (is.character(color)) {
    if (length(color) > 1 || inherits(try(col2rgb(color), silent = TRUE), "try-error")) {
      list(type = "ordinal", values = unique(color))
    } else {
      list(type = "constant", value = color)
    }
  } else {
    stop("Unexpected color type ", class(color))
  }
  x_lim <- resolve(x_lim)
  y_lim <- resolve(y_lim)
  key <- resolve(key)

  df <- data.frame(stringsAsFactors = FALSE,
    x = x,
    y = y
  )
  if (!is.null(key)) {
    df <- cbind(df, key = key)
  }
  if (color_spec$type != "constant") {
    df <- cbind(df, color = color)
  }

  # forward options using x
  x = list(
    data = df,
    color_spec = color_spec,
    color = color,
    x_label = x_label,
    y_label = y_label,
    x_lim = x_lim,
    y_lim = y_lim,
    group = group
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'd3scatter',
    x,
    width = width,
    height = height,
    package = 'd3scatter',
    dependencies = crosstalk::crosstalkLibs()
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
  htmltools::attachDependencies(
    tagList(
      shinyWidgetOutput(outputId, 'd3scatter', width, height, package = 'd3scatter')
    ),
    crosstalk::crosstalkLibs()
  )
}

#' @rdname d3scatter-shiny
#' @export
renderD3scatter <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, d3scatterOutput, env, quoted = TRUE)
}
