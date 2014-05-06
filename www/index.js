var uploadedPhotoPath;

$(document).ready(function(){

  fullForm.init();

});


var fullForm = {
  sessionID : '',
  uploadedFileList : null,
  url : 'mapnik-demo-safe-software.fmecloud.com',
  multipleFilesUplaoded: false,
  init : function(){
    this.sessionID = this.getSessionID();

    $('#file_upload_form').ajaxForm({
      url : 'https://' + this.url + '/fmedataupload/Mapnik/FacetoContour.fmw;jsessionid=' + this.sessionID + '?opt_fullpath=true',
      type : 'POST',
      dataType : 'json',
      success : function(response){
        $('#uploadedList').empty();
        if (response.serviceResponse.files.file !== undefined){
          //gets info about regular files that have been uploaded
          fullForm.updateList(response.serviceResponse.files.file);
        }
        if (response.serviceResponse.files.archive !== undefined) {
          //gets info about zip files that have been uploaded
          fullForm.updateList(response.serviceResponse.files.archive);
        }
      }
    });
  },

  getSessionID : function(){
    var id = null;
    $.ajax({
      url : 'https://' + this.url + '/fmedataupload/Mapnik/FacetoContour.fmw',
      async : false,
      type : 'POST',
      dataType : 'json',
      success : function(response){
        id = response.serviceResponse.session;
      }
    });
    return id;
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
      this.multipleFilesUplaoded = true;
    }
  },

  triggerRequestAsync: function(){
    
    if (this.multipleFilesUplaoded){
      uploadedPhotoPath = $('input[name=optionsRadios]:checked').val();
    }

    pUrlBase = 'https://' + this.url + '/fmedatastreaming/Mapnik/FacetoContour.fmw';
    pRestCall = pUrlBase + "?SourceDataset_JPEG=" + uploadedPhotoPath + "&BACKGROUND_IMAGE=$(FME_SHAREDRESOURCE_TEMP)/backgrounds/" +  document.getElementById("Background").value + ".jpg";
    window.open(pRestCall, "_self");
  }

};