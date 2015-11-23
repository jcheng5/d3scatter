# d3scatter

Simple d3.js-based scatter plot [htmlwidget](http://htmlwidgets.org) based on Mike Bostock's [example](http://bl.ocks.org/mbostock/3887118), with support added for updating data and brushing. Don't take this library too seriously, it's just intended as a testing ground for cross-widget communications.

### Installation

```r
devtools::install_github("rstudio/crosstalk")
devtools::install_github("jcheng5/d3scatter")
```

### Examples

Linked brushing

```r
library(htmltools)
library(d3scatter)

browsable(tagList(
  d3scatter(iris, ~Petal.Width, ~Petal.Length, ~Species),
  d3scatter(iris, ~Sepal.Width, ~Sepal.Length, ~Species)
))
```

Updating data

```r
library(shiny)
library(d3scatter)

ui <- fluidPage(
  d3scatterOutput("scatter1", height = 400),
  d3scatterOutput("scatter2", height = 400)
)

server <- function(input, output, session) {
  jitter_by <- 0.1
  jittered <- reactive({
    on.exit(invalidateLater(1000))
    iris$Sepal.Length <- jitter(iris$Sepal.Length, amount = jitter_by)
    iris$Sepal.Width <- jitter(iris$Sepal.Width, amount = jitter_by)
    iris$Petal.Length <- jitter(iris$Petal.Length, amount = jitter_by)
    iris$Petal.Width <- jitter(iris$Petal.Width, amount = jitter_by)
    iris
  })
  output$scatter1 <- renderD3scatter({
    d3scatter(jittered(),
      ~Sepal.Length, ~Sepal.Width,
      ~toupper(Species),
      x_lim = ~grDevices::extendrange(iris$Sepal.Length, f = jitter_by),
      y_lim = ~grDevices::extendrange(iris$Sepal.Width, f = jitter_by)
    )
  })
  output$scatter2 <- renderD3scatter({
    d3scatter(jittered(),
      ~Petal.Length, ~Petal.Width,
      ~toupper(Species),
      x_lim = ~grDevices::extendrange(iris$Petal.Length, f = jitter_by),
      y_lim = ~grDevices::extendrange(iris$Petal.Width, f = jitter_by)
    )
  })
}

shinyApp(ui, server)
```
