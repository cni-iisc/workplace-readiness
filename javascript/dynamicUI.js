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
      //url: window.location.href+"api/retrieve",
    $.ajax({
      type: "POST",
      url: "https://workplacereadinesscalculator.xyz/retrieve",
      data: "data="+JSON.stringify({'uuid': uuid_field}),
      success: function(data){
        if (data.length != 0){
            var db_input = data[0]['inputs'];
            console.log(db_input);
            for (var key in db_input) {
                if (db_input.hasOwnProperty(key)){
                    var db_value = db_input[key];
                    populate_field(key, db_value);
                }
            }
            $("#uuid").val(uuid_field);
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
        $("html, body").animate({ scrollTop: 0 });
    });

    // Stop enter from submitting and shift focus to the next field
    $('form input').keydown(function (e) {
        if (e.keyCode == 13) {
            var inputs = $(this).parents("form").eq(0).find(":input");
            if (inputs[inputs.index(this) + 1] != null) {                    
                inputs[inputs.index(this) + 1].focus();
            }
            e.preventDefault();
            return false;
        }
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
            $(".uuid_field").slideDown();
            $(".uuid_status_info").slideDown();
        }
        else {
            $(".uuid_field").slideUp();
            $(".uuid_status_info").slideUp();
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

    $('#nShifts').on('focusin', function(){
        $(this).data('prev_value', $(this).val());
    });

    // Dynamic gender table for shifts...
    $("#nShifts").on("change", function() {
        var prev_value = parseInt($("#nShifts").data('prev_value'));
        prev_value = Math.max(prev_value, 0);
        var count_cal = parseInt($("#nShifts").val());
        count_cal = Math.min(count_cal, $('#nShifts').attr('max'));
        $("#nShifts").val(count_cal);
        var count_diff = count_cal - prev_value;

        if (count_cal==0) {
            $("#shiftsTable tbody").slideUp();
            $("#shiftsTable tbody").remove();
            $(".nShifts_info").slideUp();
            }
        else if (count_diff>0 && prev_value>0){
            for (i = 0; i < count_diff; i++) {
                markup = "<tr class='emp_info_"+(prev_value+i+1)+"' style='display: none;'><td>Shift "+(prev_value+i+1)+"</td><td class='px-1 emp_info_"+(prev_value+i+1)+"' style='display: none;'><input class='form-control' type='number' id='nM_"+(prev_value+i+1)+"' min='0' value='34'></td><td class='px-1 emp_info_"+(prev_value+i+1)+"' style='display: none;'><input class='form-control' type='number' id='nF_"+(prev_value+i+1)+"' min='0' value='25'></td><td class='px-1 emp_info_"+(prev_value+i+1)+"' style='display: none;'><input class='form-control' type='number' id='nOth_"+(prev_value+i+1)+"' min='0' value='0'></td><td class='px-1 emp_info_"+(prev_value+i+1)+"' style='display: none;'><input class='form-control' type='number' id='pCS_"+(prev_value+i+1)+"' min='0' value='2'></td></tr>";
                $("#shiftsTable tbody").append(markup);
            }
            for (i = 0; i < count_diff; i++) {
                $(".emp_info_"+(prev_value+i+1)).fadeIn();
            }
        } else if (count_diff>0 && prev_value==0) {
            var markup = "<tbody> </tbody>";
            $("#shiftsTable").append(markup);
            for (i = 0; i < count_diff; i++) {
                markup = "<tr class='emp_info_"+(prev_value+i+1)+"' style='display: none;'><td>Shift "+(prev_value+i+1)+"</td><td class='px-1 emp_info_"+(prev_value+i+1)+"' style='display: none;'><input class='form-control' type='number' id='nM_"+(prev_value+i+1)+"' min='0' value='34'></td><td class='px-1 emp_info_"+(prev_value+i+1)+"' style='display: none;'><input class='form-control' type='number' id='nF_"+(prev_value+i+1)+"' min='0' value='25'></td><td class='px-1 emp_info_"+(prev_value+i+1)+"' style='display: none;'><input class='form-control' type='number' id='nOth_"+(prev_value+i+1)+"' min='0' value='0'></td><td class='px-1 emp_info_"+(prev_value+i+1)+"' style='display: none;'><input class='form-control' type='number' id='pCS_"+(prev_value+i+1)+"' min='0' value='2'></td></tr>";
                $("#shiftsTable tbody").append(markup);
                $(".emp_info_"+(prev_value+i+1)).fadeIn();
            }
            $("#shiftsTable tbody").slideDown();
            $("#shiftsTable").slideDown();
            $(".nShifts_info").slideDown();
        } else if (count_diff<0 && prev_value>0){
            for (i = 0; i < Math.abs(count_diff); i++) {
                $(".emp_info_"+(prev_value-i)).fadeOut( function() {
                    $(this).remove();
                });
            }
        }
    });

    // If elevator flag = false, disable elevetor capacity input.
    $("#nEle").on("input", function() {
         var elevator_counts = parseInt($("#nEle").val());
         if (elevator_counts==0){
              $("#eleCpct").val(0);
              $("#eleCpct_vsbl").slideUp();
              $("#nEleDinf_vsbl").slideUp();
         }
         else{
              $("#eleCpct").val(8);
              $("#eleCpct_vsbl").slideDown();
              $("#nEleDinf_vsbl").slideDown();
         }
    });

    //FIXME: Add an onLoad query for setting value of cntn to 1 even if the cached value is 0
    // If canteen flag = false, disable breakfast, lunch and coffee/snacks inputs.
    $("input[name='cntn']").on("change", function() {
         var selected_value = $("input[name='cntn']:checked").val();
         if (selected_value==0) {
            $("#seatingFood").val(0);
            $("#seatingFood_dspl").slideDown();

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
              $(".meals_info").slideUp();
         }
         else {
              $("#seatingFood").val(1);
              $("#seatingFood_dspl").slideUp();
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
              $(".meals_info").slideDown();
         }
    });

    // If seating area for food flag = false, disable breakfast, lunch and coffee/snacks inputs.
    $("input[name='seatingFood']").on("change", function() {
         var selected_value = $("input[name='seatingFood']:checked").val();
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
              $(".meals_info").slideUp();
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
              $(".meals_info").slideDown();
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
            $("#cmpTrvl_title").slideUp();
            $("#cmpTrvl_info").slideUp();
        }
        else {
            $("#cmpTrvl_title").slideDown();
            $("#cmpTrvl_info").slideDown();
        }
     });
    
     // Self Owned Vehicles
     $('input.slfOwnd').on("input", function () {
        var slfTrnsprtUsrs = parseInt($("#trvlr5Kslf").val()) + parseInt($("#trvlr10Kslf").val()) + parseInt($("#trvlr10Kplusslf").val());
        if (slfTrnsprtUsrs==0){
            $("#slfTrvl_info").slideUp();
        }
        else {
            $("#slfTrvl_info").slideDown();
        }
     });

     // Walkers
     $('input.wlkrs').on("input", function () {
        var nWlk = parseInt($("#nWlk").val());
        if (nWlk==0){
            $("#wlkr_info").slideUp();
        }
        else {
            $("#wlkr_info").slideDown();
        }
     });

     // Public Transport Users
     $('input.pubTrnsprt').on("input", function () {
        var pubTrnsprtUsrs = parseInt($("#trvlr5Kpub").val()) + parseInt($("#trvlr10Kpub").val()) + parseInt($("#trvlr10Kpluspub").val());
        if (pubTrnsprtUsrs==0){
            $("#pubTrvl_info").slideUp();
        }
        else {
            $("#pubTrvl_info").slideDown();
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
            $("#centralAC_Q").slideUp();
            $("#tempAC_Q").slideUp();
        } else {
            $("#centralAC_Q").slideDown();
            $("#tempAC_Q").slideDown();
        }
    });

    // Access controlled
    $("input[name='acsCntrl']").on("change", function() {
        var selected_value = $("input[name='acsCntrl']:checked").val();
        if (selected_value==0){
            $(".acsCntrl_info").slideUp();
        } else {
            $(".acsCntrl_info").slideDown();
        }
    });

    // Stairways
    $("input[name='strAvlbl']").on("change", function() {
        var selected_value = $("input[name='strAvlbl']:checked").val();
        if (selected_value==0){
            $(".strAvlbl_info").slideUp();
        } else {
            $(".strAvlbl_info").slideDown();
        }
    });
    
}); 
