function check_capacity(vehicle_type){
    var variable_act = '#'+vehicle_type+'CpctAct';
    var variable_cur = '#'+vehicle_type+'CpctCur';
    var actual_capacity = parseInt($(variable_act).val());
    if (actual_capacity==0){
        $(variable_cur).val(0);
        $(variable_cur).prop("readonly", true);
    }
    else {
        $(variable_cur).prop("readonly", false);
    }
}

function meal_capacity(meal_type){
    var meal_number = '#n'+meal_type;
    var meal_duration = '#d'+meal_type;
    var count = parseInt($(meal_number).val());
    if (count==0){
        $(meal_duration).val(0);
        $(meal_duration).prop("readonly", true);
    } else {
        if (meal_type!="Lnch"){
            $(meal_duration).val(60);
        } else {
            $(meal_duration).val(90);
        }    
        $(meal_duration).prop("readonly", false);
    }
}

function populate_field(key, db_value){
    var input_type = $("#"+key).attr('type');
    if (input_type=='number' || input_type=='text' || input_type=='email'){
        $("#"+key).val(db_value);
    } else if ($('#'+key+'_'+db_value.toString()).is(':radio')){
        $('#'+key+'_'+db_value.toString()).attr('checked', true);
    } else if ($('#'+key).is('select')){
        $('#'+key).val(db_value);
    }
}

function get_data(uuid_field){
    $.ajax({
      type: "POST",
      url: "https://workplacereadinesscalculator.xyz/retrieve",
      data: "data="+{'uuid': uuid_field},
      success: function(data){
        if (data.length != 0){
            var db_input = data['db_record']['inputs'];
            for (var key in db_input) {
                if (db_input.hasOwnProperty(key)){
                    var db_value = db_input[key];
                    populate_field(key, db_value);
                }
            }
            $("#uuid").prop("readonly", true);
            $("#uuid_status").val("Valid UUID");
        } else {
            $("#uuid_status").val("Invalid UUID");
        }
      }
    });
}

$(document).ready(function(){
    // Add GoK guidelines html
    $(function(){
        $("#includedContent").load("GoK_guidelines.html"); 
    });
    
    // Accordion scroll to the starting of card
    $('.collapse').on('shown.bs.collapse', function(e) {
        var $card = $(this).closest('.card');
        $('html,body').animate({
          scrollTop: $card.offset().top-125
        }, 500);
    });  

    // Enable UUID
    $("input[name='uuidQ']").on("change", function() {
        var selected_value = parseInt($("input[name='uuidQ']:checked").val());
        console.log(selected_value);
        if (selected_value==1) {
            $(".uuid_field").show();
            $(".uuid_status_info").show();
        }
        else {
            $(".uuid_field").hide();
            $(".uuid_status_info").hide();
        }
    });

    // Enter UUID
    $("#uuid").on("input", function() {
        var selected_value = $("#uuid").val();
        get_data(selected_value);
    });

    // Alert user only in portrait mode on mobile browser...
    if(window.innerHeight > window.innerWidth){ 
         alert("Please use this website in landscape mode for better experience or use a computer to fill the form.");
    }

    // Enable special questions for Manufacturing...
    $("#NOE").on("input", function() {
         var selected_value = parseInt($("#NOE").val());
         if (selected_value==3){
              $("#mnfctHead").show();
              $("#mnfctQstns").show();
              $("#mnfctHead_epi").show();
              $("#mnfctQstns_epi").show();
         } else {
              $("#mnfctHead").hide();
              $("#mnfctQstns").hide();
              $("#mnfctHead_epi").hide();
              $("#mnfctQstns_epi").hide();
         }
    });

    // Dynamic gender table for shifts...
    $("#nShifts").on("input", function() {
         var count_cal = $("#nShifts").val();
         if (count_cal>0){
                $("#shiftsTable tbody").remove();
                $(".nShifts_info").show();
                var markup = "<tbody> </tbody>";
                $("#shiftsTable").append(markup);
                count_cal = Math.min(count_cal, $('#nShifts').attr('max'));
                $("#nShifts").val(count_cal);
                for (i = 0; i < count_cal; i++) {
                    console.log(i);
                    markup = "<tr><td>Shift "+(i+1)+"</td><td class='px-1'><input class='form-control' type='number' id='nM_"+(i+1)+"' min='0' value='40'></td><td class='px-1'><input class='form-control' type='number' id='nF_"+(i+1)+"' min='0' value='25'></td><td class='px-1'><input class='form-control' type='number' id='nOth_"+(i+1)+"' min='0' value='3'></td><td class='px-1'><input class='form-control' type='number' id='pCS_"+(i+1)+"' min='0' value='2'></td></tr>";
                    $("#shiftsTable tbody").append(markup);
                }
            } else {
            $("#shiftsTable tbody").remove();
            $(".nShifts_info").hide();
        }
    });

    // If elevator flag = false, disable elevetor capacity input.
    $("#nEle").on("input", function() {
         var elevator_counts = parseInt($("#nEle").val());
         if (elevator_counts==0){
              $("#eleCpct").val(0);
              $("#eleCpct_vsbl").hide();
              $("#nEleDinf_vsbl").hide();
         }
         else{
              $("#eleCpct").val(8);
              $("#eleCpct_vsbl").show();
              $("#nEleDinf_vsbl").show();
         }
    });

    // If canteen flag = false, disable breakfast, lunch and coffee/snacks inputs.
    $("input[name='cntn']").on("change", function() {
         var selected_value = $("input[name='cntn']:checked").val();
         if (selected_value==0) {
              $("#nBrkfst").val(0);
              $("#nLnch").val(0);
              $("#nSnck").val(0);
              $("#dBrkfst").val(0);
              $("#dLnch").val(0);
              $("#dSnck").val(0);
              $("#nBrkfst").prop("readonly", true);
              $("#nLnch").prop("readonly", true);
              $("#nSnck").prop("readonly", true);
              $("#dBrkfst").prop("readonly", true);
              $("#dLnch").prop("readonly", true);
              $("#dSnck").prop("readonly", true);
         }
         else {
              $("#nBrkfst").val(20);
              $("#nLnch").val(25);
              $("#nSnck").val(15);
              $("#dBrkfst").val(60);
              $("#dLnch").val(90);
              $("#dSnck").val(60);
              $("#nBrkfst").prop("readonly", false);
              $("#nLnch").prop("readonly", false);
              $("#nSnck").prop("readonly", false);
              $("#dBrkfst").prop("readonly", false);
              $("#dLnch").prop("readonly", false);
              $("#dSnck").prop("readonly", false);
         }
    });

    // Breakfast
    $("#nBrkfst").on("input", function() {
       meal_capacity("Brkfst");
    });

    // Lunch
    $("#nLnch").on("input", function() {
        meal_capacity("Lnch");
     });

    // Snacks / coffee
    $("#nSnck").on("input", function() {
        meal_capacity("Snck");
     });

    // Company Owned Transportation
    $('input.cmpOwnd').on("input", function () {
        var cmpnTrnsprtUsrs = parseInt($("#trvlr5K").val()) + parseInt($("#trvlr10K").val()) + parseInt($("#trvlr10Kplus").val());
        if (cmpnTrnsprtUsrs==0){
            $("#cmpTrvl_title").hide();
            $("#cmpTrvl_info").hide();
        }
        else {
            $("#cmpTrvl_title").show();
            $("#cmpTrvl_info").show();
        }
     });
    
     // Self Owned Vehicles
     $('input.slfOwnd').on("input", function () {
        var slfTrnsprtUsrs = parseInt($("#trvlr5Kslf").val()) + parseInt($("#trvlr10Kslf").val()) + parseInt($("#trvlr10Kplusslf").val());
        if (slfTrnsprtUsrs==0){
            $("#slfTrvl_info").hide();
        }
        else {
            $("#slfTrvl_info").show();
        }
     });

     // Walkers
     $('input.wlkrs').on("input", function () {
        var nWlk = parseInt($("#nWlk").val());
        if (nWlk==0){
            $("#wlkr_info").hide();
        }
        else {
            $("#wlkr_info").show();
        }
     });

     // Public Transport Users
     $('input.pubTrnsprt').on("input", function () {
        var pubTrnsprtUsrs = parseInt($("#trvlr5Kpub").val()) + parseInt($("#trvlr10Kpub").val()) + parseInt($("#trvlr10Kpluspub").val());
        if (pubTrnsprtUsrs==0){
            $("#pubTrvl_info").hide();
        }
        else {
            $("#pubTrvl_info").show();
        }
     });

     // Vehicle capacities
     $("#bsCpctAct").on("input", function() {
         check_capacity("bs"); // For bus
     });

     $("#mnBsCpctAct").on("input", function() {
        check_capacity("mnBs"); // For minibus
    });

    $("#vnCpctAct").on("input", function() {
        check_capacity("vn"); // For van
    });

    $("#svCpctAct").on("input", function() {
        check_capacity("sv"); // For SUV
    });

    $("#crCpctAct").on("input", function() {
        check_capacity("cr"); // For car
    });

    // Air conditioning
    $("#percAC").on("input", function() {
        var percAc = parseInt($("#percAC").val());
        if (percAc==0){
            $("#centralAC_Q").hide();
            $("#tempAC_Q").hide();
        } else {
            $("#centralAC_Q").show();
            $("#tempAC_Q").show();
        }
    });

    // Access controlled
    $("input[name='acsCntrl']").on("change", function() {
        var selected_value = $("input[name='acsCntrl']:checked").val();
        if (selected_value==0){
            $(".acsCntrl_info").hide();
        } else {
            $(".acsCntrl_info").show();
        }
    });

    // Stairways
    $("input[name='strAvlbl']").on("change", function() {
        var selected_value = $("input[name='strAvlbl']:checked").val();
        if (selected_value==0){
            $(".strAvlbl_info").hide();
        } else {
            $(".strAvlbl_info").show();
        }
    });
    
}); 
