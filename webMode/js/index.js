//when html page is loaded with all js files
$(document).ready(()    =>  {

    //hide loadingg effect for download
    $(".loader").hide();

    //when click on logs voice on navbar
    $('#logsModal').on('show.bs.modal', function (e) {

        //require logs at server and load on modal
        getLogs();
    })


    //when click on download button for download media
    $('#downloadMediaModal').on('show.bs.modal', function (e) {

        $("#subtitles").prop('disabled', true);    //disable subtitles  
        $("#previewMode").prop("disabled", true)    //disable previewMode  

        //When video mode is clicked
        $("#videoMode").on("click", () => {

            if ($("#videoMode").is(":checked")) {
                $("#subtitles").prop('disabled', false);  //enable subtitles
                $("#previewMode").prop("disabled", false) //enable preview mode  

                $("#audioMode").prop('checked', false);   //delete previous check on audio 
            } else {
                $("#subtitles").prop('disabled', true);  //enable subtitles
                $("#previewMode").prop("disabled", true) //enable preview mode  
                
                $("#audioMode").prop('checked', false);   //delete previous check on audio 
                $("#subtitles").prop('checked', false);   //delete previous check on subtitles 
                $("#previewMode").prop('checked', false);   //delete previous check on previewMode 

                //delete last preview video
                $("#previewVideo").html("");
            }
        })

        //if click on audioMode
        $("#audioMode").on("click", () => {
            $("#subtitles").prop('disabled', true);    //disable subtitles  
            $("#previewMode").prop("disabled", true)    //disable previewMode  

            $("#subtitles").prop('checked', false);    // delete previous check on subtitles
            $("#videoMode").prop('checked', false);    // delete previous check on video
            $("#previewMode").prop('checked', false);    // delete previous check on previewMode

            //delete last preview video
            $("#previewVideo").html("");

        })

        //delete last link
        $("#inputLink").val("");

        //delete last preview video
        $("#previewVideo").html("");

        //Delete previous check
        $("#previewMode").prop('checked', false);

        //when link is pasted or is changed
        $("#inputLink").on("keydown paste", ()    =>  {

            //only if previewMode is checked
            if ($("#previewMode").is(":checked")) {
                $("#previewMode").trigger("click")
            }     
        })
        
        //when click on previewMode
        $("#previewMode").on("click", ()    =>  {

            setPreviewVideo();
            
        })

        //When click on "Download" button
        $(".btnDownloadMedia").on("click", (ev) => {
            ev.stopImmediatePropagation();

            //get link to download
            const link = $("#inputLink").val();

            //if all fields are compiled
            if ($('div.checkbox-group :checkbox:checked').length > 0 && link.length > 0) {

                //get mode
                let mode = "";

                //check mode selected
                if ($("#videoMode").is(":checked")) {
                    mode = "video";
                } else if ($("#audioMode").is(":checked")) {
                    mode = "audio";
                }

                //get subtitles
                let subtitles = "N";
                if ($("#subtitles").is(":checked")) {
                    subtitles = "Y";
                }

                downloadMedia(link, mode, subtitles);
            } else {
                toastr.error("Please compile all fields")
            }
        })
      })
})

/**
 * Download media
 * @param link -> link to download 
 * @param mode -> mode: audio or video
 * @param subtitles -> subtitles: Y or N
 */
function downloadMedia(link, mode, subtitles)    {

    //show loading effect
    $(".loader").show();

    //show block container for downloading
    $(".blockDuringDownload").show();

    $.ajax({

        url : "http://localhost:8080/downloadMedia",
        type : 'POST',
        data : {link: link, mode: mode, subtitles: subtitles},
        dataType:'json',
        success : function(res) {        
            if (res.error) {
                toastr.error(res.error);
            } else {
                toastr.success(res.message);
            }      

            $(".loader").hide();

            //hide block container for downloading
            $(".blockDuringDownload").hide();
        }
    });
    
}

/**
 * require logs at server and compile logs modal
 */
function getLogs()    {

    $.ajax({
        url : "http://localhost:8080/getLogs",
        type : 'GET',
        success : function(data) {        
            if (data.error) {
                toastr.error(data.error);
            } else {
                $(".logsModalBody").html(data.success)
            }      
        }
    });   
}


function setPreviewVideo()  {

    if ($("#previewMode").is(":checked")) {

        //delete last preview video
        $("#previewVideo").html("");

        //get current link
        const currentLink = $("#inputLink").val();

        let embedCodeFromLink = getEmbedCode(currentLink);

        //try to load video
        $("#previewVideo").html(embedCodeFromLink);
    } else {
        //delete last preview video
        $("#previewVideo").html("");
    }
}

function getEmbedCode(link) {

    let id = "";

    //complex format
    if (link.indexOf("&") != -1) {

        //get only id of link - you can download audio to get id
        id = link.substring(link.indexOf("v=") + 2, link.indexOf("&"))

        //simple format
    } else {
        //get only id of link - you can download audio to get id
        id = link.substring(link.indexOf("v=") + 2, link.length)
    }

    if (id != "") {
    
        return '<iframe style="position:relative" width="360" height="315" src="//www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe>';
    } else {
        return "";
    }
}