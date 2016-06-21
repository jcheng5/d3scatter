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

sd <- SharedData$new(iris)

browsable(tagList(
  d3scatter(sd, ~Petal.Width, ~Petal.Length, ~Species),
  d3scatter(sd, ~Sepal.Width, ~Sepal.Length, ~Species)
))
```

Updating data, using Shiny

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
    SharedData$new(iris)
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

Linked brushing between d3scatter and ggplot2, using Shiny

```r
library(shiny)
library(d3scatter)
library(dplyr)
library(ggplot2)

ui <- fluidPage(
  d3scatterOutput("scatter1", height = 300),
  plotOutput("plot1", height = 300, brush = brushOpts("brush", direction = "x"))
)

server <- function(input, output, session) {
  sd <- crosstalk::SharedData$new(iris %>% add_rownames(), "rowname")
  
  output$scatter1 <- renderD3scatter({
    d3scatter(sd,
      ~Sepal.Length, ~Sepal.Width,
      ~toupper(Species)
    )
  })

  output$plot1 <- renderPlot({
    df <- sd$data(TRUE)
    df$selected_ <- factor(df$selected_, levels = c(TRUE, FALSE))
    if (any(is.na(df$selected_))) {
      ggplot(df, aes(x = Species)) + geom_bar()
    } else {
      ggplot(df, aes(x = Species, alpha = selected_)) + geom_bar() +
        scale_alpha_manual(values = c(1.0, 0.2)) +
        guides(alpha = FALSE)
    }
  })
  observeEvent(input$brush, {
    df <- brushedPoints(sd$data(FALSE), input$brush, allRows = TRUE)
    selected <- row.names(df)[df$selected_]
    str(selected)
    sd$selection(selected)
  }, ignoreNULL = FALSE)
}

shinyApp(ui, server)
```
