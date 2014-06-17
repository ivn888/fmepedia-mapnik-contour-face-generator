var uploadedPhotoPath;

$(document).ready(function(){

  var fmes = new FMEServer({
    server : fullForm.host,
    token : fullForm.token
  });
  
  //Call server and get the session ID and path
  fmes.getSession(fullForm.repository, fullForm.workspace, function(json){
    fullForm.session = json.serviceResponse.session;
    fullForm.path = json.serviceResponse.files.folder[0].path;

    //Build up the form
    fullForm.init();
  });

});


var fullForm = {
  host : 'https://fmepedia2014-safe-software.fmecloud.com',
  token : '8be243c0fc2f5f34977050bdab57ebbdd3e72aa2',
  repository : 'Mapnik_Webinar',
  workspace : 'FacetoContour.fmw',
  multipleFilesUploaded: false,
  session : null,
  path : null,
  arrayFiles: '',
  uploadedFileList : null,

  init : function(){
    //--------------------------------------------------------------
    //Initialize the drag and drop file upload area
    //--------------------------------------------------------------
    //control behaviour of the fileuploader
    $('#fileupload').fileupload({
      url: fullForm.host + '/fmedataupload/' + fullForm.repository + '/' +  fullForm.workspace + ';jsessionid=' + fullForm.session,
      dropzone: $('#dropzone'),
      autoUpload: true,

      //when a new file is added either through drag and drop or 
      //file selection dialog
      add: function(e, data){
        //displays filename and progress bar for any uploading files
        $('#fileTable').show();
        data.context = $('#fileTable');
        $.each(data.files, function(index, file) {
          if (!index) {
            var elemName = file.name;
            elemName = elemName.replace(/[.\(\)]/g,'');
            elemName = elemName.split(' ').join('');

            var row = $("<div id='row"+ elemName + "' class='fileRow'/>");

            var name = $("<div class='fileName'>" + file.name + '</div>');
            var progressBar = $("<div id='progress" + elemName + "' class='progress progress-striped' />");
            progressBar.append("<div class='progress-success progress-bar bar'/>");
            var progress = $("<div class='progressBar' id='" + elemName +"'/>").append(progressBar);
          }

          name.appendTo(row);
          progress.appendTo(row);
          row.appendTo(data.context);
        });

        data.submit();
      },

      done: function(e, data){
        //update list of uploaded files with button to select 
        //them as source datasets for translation
        var elemName = data.files[0].name;
        elemName = elemName.replace(/[.\(\)]/g, '');
        elemName = elemName.split(' ').join('');

        var test = 'stop';

        var button = $("<div class='fileBtn'/>");
        button.append("<button class='btn' onClick='fullForm.toggleSelection(this)'>Select this File</button>");
        button.insertAfter('#' + elemName);
      },

      fail: function(e, data) {
        $.each(data.result.files, function(index, file) {
          var error = $('<span/>').text(file.error);
          $(data.context.children()[index])
            .append('<br>')
            .append(error);
        });
      },

      dragover: function(e, data){
            //going to use this to change look of 'dropzone'
            //when someone drags a file onto the page
        var dropZone = $('#dropzone');
        var timeout = window.dropZoneTimeout;

        if (!timeout){
          dropZone.addClass('in');
        }
        else{
          clearTimeout(timeout);
        }

        var found = false;
        var node = e.target;
        do {
          if (node == dropZone[0]){
            found = true;
            break;
          }
          node = node.parentNode;
        }
        while (node != null);
        if (found){
          $('#dropText').show();
          dropZone.addClass('hover');
        }
        else {
          $('#dropText').hide();
          dropZone.removeClass('hover');
        }
        window.dropZoneTimeout = setTimeout(function(){
          window.dropZoneTimeout = null;
          $('#dropText').hide();
          dropZone.removeClass('in hover');
        }, 100);
      },

      //give updates on upload progress of each file
      progress: function(e, data){
        var progress = parseInt(data.loaded / data.total * 100, 10);

        var name = data.files[0].name
        name = name.replace(/[.\(\)]/g, '');
        name = name.split(' ').join('');

        var progressId = '#progress' + name + ' .bar';
        $(progressId).css('width', progress + '%');

      }
    });
  },

  updateList : function(fileList){
    //We are just going to process the last file they uploaded.
    //If we only have one result just return text
    if (fileList.length === 1){
        $('#uploadedList').html('<div>Name: ' + fileList[0].name + '</div>');
        uploadedPhotoPath = fileList[0].path;
    }else{
    //If we have 2 results return radio
      var radios = '';
      for (each in fileList){
        radios += '<div class="radio">'+
          '<label>'+
        '    <input type="radio" name="optionsRadios" id="optionsRadios'+each+'" value="'+fileList[each].path+'" checked>'+
        '    '+fileList[each].name +
        '  </label>'+
        '</div>';
      }
      $('#uploadedList').html(radios);
      fullForm.multipleFilesUploaded = true;
    }
  },

submit : function() {
    var files = '"';
    var fileList = $('.fileRow');

    //check a file has been uploaded and at least one is selected
    if (fileList.length === 0){
      //put out an alert and don't continue with submission
      $('#dropzone').prepend('<div class="alert alert-error"> Please upload a file. <button type="button" class="close" data-dismiss="alert">&times;</button></div>');
    }

    else{
      var fileSelected = false;
      for(var y=0; y<fileList.length;y++){
        if (fileList[y].lastChild.textContent == 'Selected'){
          fileSelected = true;
          break;
        }
      }
      if(fileSelected === false){
        //put out alert and don't continue with submission
        $('#dropzone').prepend('<div class="alert alert-error"> Please select a photo.<button type="button" class="close" data-dismiss="alert">&times;</button></div>');
      }
      else{
        
        //submit file to server
        for (var i = 0; i < fileList.length; i++){
          if (fileList[i].lastChild.textContent == 'Selected'){
            files = files + '"' + fullForm.path + '/' + fileList[i].firstChild.textContent + '"';
          }
        }

        files = files + '"';

        pUrlBase = fullForm.host + '/fmedatastreaming/' + fullForm.repository + '/' + fullForm.workspace;
        pRestCall = pUrlBase + "?SourceDataset_JPEG=" + files + "&BACKGROUND_IMAGE=$(FME_SHAREDRESOURCE_TEMP)/backgrounds/" + document.getElementById("Background").value + ".jpg";
        window.open(pRestCall, "_self");

      }
    }
  },

  toggleSelection : function(e){
    
    $('#fileTable').children('.fileRow').each(function(){
      var btn = $(this).children('.fileBtn').children('button:first-child');
      if($(btn) != $(e)){
        $(btn).text('Select this File');
        $(btn).removeClass('btn-success');
      }
    });

    if(e.textContent == 'Select this File'){
      e.textContent = 'Selected';
      e.className = 'btn btn-success';
    }
    else {
      e.textContent = 'Select this File';
      e.className = 'btn';
    }
  }

};