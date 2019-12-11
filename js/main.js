$(document).ready(function() {
  
  var $diffInput = $('#diff-input');
  var $diffSubmit = $('#diff-submit');
  var $diffOutput = $('#diff-output');
  var regex = /[\n]+/g;
  
  $(document).keypress(function(e) {
    if(e.which === 13) {
      e.preventDefault();
      $diffSubmit.click();
    }
  });
  
  $diffSubmit.on('click', function() {
    
    $diffOutput.html('');
    
    var diffInputArray = $diffInput.val().split('diff --git ');
    
    // Note to self, output as a table as per github
    // Look for `diff --git` and build a URL/link to the file the store admin
    
    
    // Each block of code
    $.each(diffInputArray, function(i, blockVal) {
      
      if (i > 0) {
        
        if (blockVal.indexOf('config.yml') === -1) {
        
          var diffBlockArray = blockVal.split(/[\n]+/g);
          var diffBlockContent = '';
          var fileEditedMessage;
          var origIndex;
          var origIndexStart = 0;
          var origIndexInc;
          var newIndex;
          var newIndexStart = 0;
          var newIndexInc;
          var incOrigIndex;
          var incNewIndex;
          var editedSection;
          var editedFile;
          var indexBreak;
          var indexBreakCount = 0;


          // Each line in block
          $.each(diffBlockArray, function(i, val) {

            // If first line in block, create descriptive sentence
            if (i === 0) {

              var lineValueArray = val.split('/');
              var lineValueArrayOffset = lineValueArray.length - 2;

              $.each(lineValueArray, function(i, val) {

                if (i >= lineValueArrayOffset) {

                  // To Do: If new file, update verbiage.

                  if (fileEditedMessage === undefined) {
                    editedSection = val;
                    fileEditedMessage = 'Under the <strong>' + editedSection + '</strong> folder in the ';
                  } else {
                    editedFile = val;
                    fileEditedMessage = fileEditedMessage + '<strong>' + editedFile + '</strong> file, make the following edits:';
                  }

                }

              });

            }

            if (i > 1) {

              if (val.indexOf("\ No newline at end of file") === -1) {

                if (val.indexOf("index ") !== 0) {

                  if (val.indexOf("+++") === -1) {

                    if (val.indexOf("---") === -1) {

                      if (val.indexOf("@@") > -1) {

                        var indexRaw = val.replace('@@ ', '').replace(' @@', '');
                        var indexRawArray = indexRaw.split(' ');
                        
                        indexBreak = true;
                        indexBreakCount = indexBreakCount + 1;

                        $.each(indexRawArray, function(i, lineIndexVal) {

                          if (lineIndexVal.indexOf('-') > -1) {
                            var origIndexFormat = lineIndexVal.replace('-', '');
                            var origIndexArray = origIndexFormat.split(',');

                            origIndexStart = parseInt(origIndexArray[0]);
                            origIndexInc = parseInt(origIndexArray[1]);
                          }

                          if (lineIndexVal.indexOf('+') > -1) {
                            var newIndexFormat = lineIndexVal.replace('+', '');
                            var newIndexArray = newIndexFormat.split(',');

                            newIndexStart = parseInt(newIndexArray[0]);
                            newIndexInc = parseInt(newIndexArray[1]);
                          }

                        });

                      } else {

                        var lineValue = val.replace(/</g, '&lt;');
                        var contentEdited = '';
                        var contentEditedSymbol = '';

                        if (val.indexOf("+") === 0) {
                          contentEdited = 'content--added';
                          contentEditedSymbol = '+';
                          lineValue = lineValue.replace('+', '');
                        }

                        if (val.indexOf("-") === 0) {
                          contentEdited = 'content--removed';
                          contentEditedSymbol = '-';
                          lineValue = lineValue.replace('-', '');
                        }

                        // Contains '-' or nothing
                        if (val.indexOf("+") !== 0) {
                          incOrigIndex = true;
                          if (origIndex && indexBreak === false) {
                            origIndex = origIndex + 1;
                          } else {
                            origIndex = origIndexStart;
                          }
                        } else {
                          incOrigIndex = false;
                        }

                        // Contains '+' or nothing
                        if (val.indexOf("-") !== 0) {
                          incNewIndex = true;
                          if (newIndex && indexBreak === false) {
                            newIndex = newIndex + 1;
                          } else {
                            newIndex = newIndexStart;
                          }
                        } else {
                          incNewIndex = false;
                        }
                        
                        if (indexBreak && indexBreakCount > 1) {
                        
                          diffBlockContent = diffBlockContent + '<tr class="content--break"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>'
                          
                        } else {
                          
                          if (incOrigIndex && incNewIndex) {
                            diffBlockContent = diffBlockContent + '<tr class="' + contentEdited + '"><td data-number-a="' + origIndex + '"></td><td data-number-b="' + newIndex + '"></td><td data-symbol="' + contentEditedSymbol + '"></td><td>' + lineValue + '</td></tr>';
                          }

                          if (incOrigIndex && !incNewIndex) {
                            diffBlockContent = diffBlockContent + '<tr class="' + contentEdited + '"><td data-number-a="' + origIndex + '"></td><td data-number-b=""></td><td data-symbol="' + contentEditedSymbol + '"></td><td>' + lineValue + '</td></tr>';
                          }

                          if (!incOrigIndex && incNewIndex) {
                            if (newIndex === newIndexStart) {
                              fileEditedMessage = 'Under the <strong>' + editedSection + '</strong> folder create a new file called <strong>' + editedFile + '</strong> and paste the following code into it.'
                            }
                            diffBlockContent = diffBlockContent + '<tr class="' + contentEdited + '"><td data-number-a=""></td><td data-number-b="' + newIndex + '"></td><td data-symbol="' + contentEditedSymbol + '"></td><td>' + lineValue + '</td></tr>';
                          }
                          
                        }
                        
                        indexBreak = false;

                      }

                    }

                  }

                }

              }

            }

          });

          $diffOutput.append(
            '<h3>' + fileEditedMessage + '</h3>' +
            '<div class="code-block">' +
              '<table>' + 
                diffBlockContent + 
              '</table>' +
            '</div>'
          );

        }
        
      }
      
    });
    
    $diffOutput.prepend('<hr><p><span class="cta cta--two">Step 2</span></p><h3 class="brand--two">Work through the following instructions, adding and removing code where defined.</h3><hr>');
    $diffOutput.append("<hr><p><span class='cta'>Step 3</span></p><h3>You've finished... have a snack!</h3>");
    
  });
  
}); 
