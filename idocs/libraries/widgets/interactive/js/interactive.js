// Get Hint
function getHint(cell){
  bootbox.alert($('#getHint' + cell).attr('data-hint'))
  $(".bootbox").find('pre code').each(function(i, e){
    hljs.highlightBlock(e)
  })
}

// Clear Result
function clearResult(cell){
  $('#knitResult' + cell).html("");
  if (window.Shiny != undefined){
    Shiny.unbindAll();
    $("#runCode" + cell).data('val', 0);
    Shiny.bindAll();
  }
  // $("#run" + i).click();
}

// Test Code
function testCode(cell){
  bootbox.alert('Feature to Check Code is not Implemented')
}

// Bind Actions to Buttons
function bindActions(){
  $('a.iBtn').each(function(){
    var self = this;
    $(self).bind("hover", function(){
      $(self).tooltip({placement: "bottom"})
    })
   .bind("click", function(event){
      event.preventDefault();
      handleOnClick($(self).data('action'), $(self).data('cell'))
    })
  })
  // bind the action button too if Shiny is not found
  if (window.Shiny == undefined){
    $('a.action-button').each(function(){
      var self = this;
      $(self).bind("hover", function(){
        $(self).tooltip({placement: "bottom"})
      })
     .bind("click", function(event){
        event.preventDefault();
        handleOnClick($(self).data('action'), $(self).data('cell'))
      })
    })
  }
}

function handleOnClick(action, cell){
  switch (action) {
    case "testCode":
      testCode(cell)
      break;
    case "getHint":
      getHint(cell)
      break;
    case "clearResult":
      clearResult(cell) 
      break;
    case "runCode":
      runCode(cell);
      break;
    default:
      console.log("Error:invalid case");
      break;
  }
}

$(document).ready(function(){
  bindActions()
  setupCells()
})

function setupCells(){
  ACECELLS = []  
  $('textarea.interactive').each(function(i){
    var cell = $(this).data('cell')
    ACECELLS[i] = setupAceEditor(cell)
  });
};


// Set up New Ace Editor
function setupAceEditor(cell){
  // define texteditor and ace editor
  var texteditor = $('#interactive' + cell).hide();
  var editor = ace.edit('aceeditor' + cell);
  
  // setup ace editor
  editor.setTheme("ace/theme/tomorrow");
  editor.setFontSize(13);
  editor.renderer.setShowGutter(false); 
  editor.getSession().setMode("ace/mode/r");
  editor.getSession().setUseWrapMode(true);
  editor.getSession().setWrapLimitRange();
  editor.getSession().setTabSize(2);
  editor.getSession().setFoldStyle('markbegin');  
  editor.getSession().setValue(texteditor.val());
  
  // hook it up to textarea
  editor.getSession().on('change', function(e){
    texteditor.val(editor.getSession().getValue());
    texteditor.change();
  });
  
  texteditor.onchange = function() {
    texteditor.select();
  };
  return(editor) 
}

function runCode(cell){  
  var textEl = '#interactive' + cell,
    results = $(textEl).data('results'),
    resultEl = '#knitResult' + cell,
    code = $(textEl).val().replace(/\\/g, '\\\\').replace(/"/g, '\\"'),
    chunk = "```{r echo = F, message = F, warning = F, comment = NA, results='" + 
      results + "'}\n" +  code + "\n```",
    url = "http://public.opencpu.org/R/pub/base/identity/ascii",
    script = 'library(knitr)\n' +
    'knit2html(text = knit(text = "' + chunk + '"), fragment.only = TRUE)';
    
  /* Send the data using POST and put the results in a div */
  $.post(url, {x: script},
    function(data){
      $(resultEl).html(eval(data));
      $('pre code').each(function(i, e){
        hljs.highlightBlock(e);
      })
  })
  .error(function() { alert("An error occured")}); 
}
