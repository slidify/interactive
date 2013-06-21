---
title: Interactive Documents
subtitle: Slidify + Shiny
author: Ramnath Vaidyanathan
github: {user: slidify, repo: interactive, branch: "gh-pages"}
framework: minimal
mode: selfcontained
widgets: [polycharts]
highlighter: highlight.js
hitheme: solarized_light
assets:
  css: 
    - "http://fonts.googleapis.com/css?family=Open+Sans"
    - "http://fonts.googleapis.com/css?family=Open+Sans+Condensed:700"
---




# Interactive Documents with R

I gave a talk recently at the [NY Open Statistical Programming Meetup](http://www.meetup.com/nyhackr/events/122192822/), on how to use R to generate documents which are dynamic and interactive. I thought it would be useful to capture the main idea of the talk with a short demo. You can either watch the screencast, or read along for more information.

<!-- embed screencast here -->
<iframe width="595" height="340" src="http://www.youtube.com/embed/znaO6OHLTeY" frameborder="0" allowfullscreen></iframe><br/>


## Getting Started

You will need to install development versions of many R packages in order to replicate the steps in this tutorial. This will require you to upgrade to R 3.0 if you have not already done so.


```r
require(devtools)
install_github(c('slidify', 'slidifyLibraries'), 'ramnathv', ref = 'dev')
install_github('rCharts', 'ramnathv')
install_github('shiny', 'rstudio')
```


## Create Document

Now that you have all the required packages installed, we will begin by creating a document. The easiest way to do this is to use the `author` function that comes with `slidify`.


```r
author('interactive')
```


This will create a folder called `interactive` in your working directory, populate it with a skeleton, and open `index.Rmd`. We will start by first editing the YAML front matter, adding `title`, `subtitle`, `author` and `job`.



```
---
title       : Interactive Documents with R
subtitle    : Slidify + Shiny
author      : Ramnath Vaidyanathan
job         : R Hacker
framework   : io2012        # {io2012, html5slides, shower, dzslides, ...}
highlighter : highlight.js  # {highlight.js, prettify, highlight}
hitheme     : tomorrow      # 
widgets     : []            # {mathjax, quiz, bootstrap}
mode        : selfcontained # {standalone, draft}
---
```


## Inject Interactivity

There are several ways of injecting interactivity into an R Markdown document, and I will illustrate a few methods. 

### Interactive Quiz

Let us start by creating a quiz question, the usual way we do. 

```
---
## Question 1

What is 1 + 1?

1. 1
2. 2
3. 3
4. 4

hint

This is a hint

explanation

This is an explanation
```

There is nothing different so far, and if you slidify the document at this stage, you will just see a regular question with no interactivity. Now, to make this question interactive, we need to add some properties to the document.

First, we need to add the `quiz` widget and the `bootstrap` widget to the YAML front matter. This will allow the document to take advantage of the interactivity provided by the quiz widget, and the styling provided by the bootstrap widget.

```
widgets    : [bootstrap, quiz]
```

Second, we need to add some markup to the slide that will allow slidify to transform it into an interactive question.


```
--- &radio
## Question 1

What is 1 + 1?

1. 1
2. _2_
3. 3
4. 4

 *** .hint
This is a hint

 *** .explanation
This is an explanation
```


There are three components to the markup we add on this slide.

1. The `&radio` added to the slide separator instructs slidify to use the `radio` template, which ships with the `quiz` widget.
2. The answer is marked up by enclosing it within underscores.
3. The hint and the explanation are preceded by three stars and a dot, which instruct slidify to parse them as blocks, that will be made use of by the `radio` layout.

If you slidify the document at this stage, you should see a quiz question that looks like this. 

<!-- embed screenshot with link to quiz question -->

Try selecting an answer and submitting it, or asking for a hint. You will see that Slidify has utilized the markup properties and the content to create an interactive quiz question. In addition to the `radio` layout, the `quiz` widget supports seven other types of questions. I will post a full featured example on the `quiz` widget later.

### Interactive Chart

We will now add an interactive chart to the document using the package `rCharts`, and the javascript charting library `nvd3`. As before, we first need to add `nvd3` as a widget in the YAML front matter. However, since `nvd3` does not ship with `slidifyLibraries`, we will add it as an external widget.

```
ext_widgets: {rCharts: [libraries/nvd3]}
```

We now add the slide with a knitr code chunk that creates the plot.



```
---
## Interactive Chart
```{r echo = F, results = 'asis'}
require(rCharts)
haireye = as.data.frame(HairEyeColor)
n1 <- nPlot(Freq ~ Hair, group = 'Eye', type = 'multiBarChart',
  data = subset(haireye, Sex == 'Male')
)
n1$print('chart1')
`` `
```


Run slidify on the document, and you will see an interactive NVD3 plot with some nice controls.

### Interactive Console

Next, we will add an interactive console to our document. It allows the user to execute R code right inside the document, and see the resulting output. This is a very useful feature for pedagogical purposes, where you want to provide executable examples right inside a tutorial. Adding an interactive console is even easier than the quiz.

As before, we first add the `shiny` and `interactive` widgets to the list of widgets in the YAML front matter.

```
widgets    : [bootstrap, quiz, shiny, interactive]
```

We markup the slide and a knitr code chunk to instruct slidify to treat it as an interactive code chunk.


```
--- &interactive
## Interactive Console

```{r opts.label = 'interactive', results = 'asis'}
require(googleVis)
M1 <- gvisMotionChart(Fruits, idvar = 'Fruit', timevar = 'Year')
print(M1, tag = 'chart')
`` `
```


That is it, we are done! Ah, one more thing remains. You can no longer use the `slidify` function, since we need this document to be run using a shiny server. Slidify ships with a `runDeck` function that takes care of all the boilerplate for you. Just make sure that you are in the same directory as the Rmd file and then do `runDeck()`. This will open the document as a Shiny application, and if you navigate to the new slide, you will see an interactive console as shown below. Clicking on the run button will execute the code and you will see a nice and shiny googleVis motionchart on the right! Neat right!!

<!-- embed screenshot with link to interactive console slide -->


### Interactive Chart with Controls

Finally, we will use Shiny to add interactive controls to the chart we created previously. Suppose that we want to control `Sex` and the `type` of plot. Let us first add the UI. `slidifyUI` behaves almost like `shinyUI` except that it outputs a character vector.


```
```{r opts.label = 'shiny'}
slidifyUI(
  sidebarPanel(
    selectInput('sex', 'Choose Sex', c('Male', 'Female')),
    selectInput('type', 'Choose Type',
      c('multiBarChart', 'multiBarHorizontalChart')
    )
  ),
  mainPanel(
    tags$div(id = 'nvd3plot', class='shiny-html-output nvd3 rChart')
  )
)
`` `
```


We now need to add a plotting function to the server side. `runDeck` is set up so that any `R` file in the `apps` directory that starts with `app` will be automatically sourced into `shinyServer`. Hence, let us create an `apps` directory and add the following code the `app1.R`.

Note that the code is almost identical to what we used previously, except that now the `Sex` and `type` of chart are not hardcoded, and instead being controlled by the UI.

```r
require(rCharts)
output$nvd3plot <- renderChart({
  haireye = as.data.frame(HairEyeColor)
  n1 <- nPlot(Freq ~ Hair, group = 'Eye', type = input$type,
    data = subset(haireye, Sex == input$sex)
  )
  n1$set(dom = 'nvd3plot', width = 600)
  n1
})
```

If you use `runDeck()`, you will be able to see a nice nvd3plot that can be controlled using the sidebar.


