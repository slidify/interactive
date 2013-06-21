require(rCharts)
output$nvd3plot <- renderChart({
  haireye <- as.data.frame(HairEyeColor)
  n1 <- nPlot(Freq ~ Hair, group = 'Eye', type = input$type,
    data = subset(haireye, Sex == input$sex)
  )
  n1$set(dom = 'nvd3plot', width = 600)
  n1
})