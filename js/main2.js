/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-11-8
 * Time: 下午5:15
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function(){
    // variable
    var SupportsTouches = ("createTouch" in document);//判断是否支持触摸
    var StartEvent = SupportsTouches ? "touchstart" : "mousedown";//支持触摸式使用相应的事件替代
    var MoveEvent = SupportsTouches ? "touchmove" : "mousemove";
    var EndEvent = SupportsTouches ? "touchend" : "mouseup";
    var dragging = false;
    var startPoint = new Object;//开始移动的坐标
    var nowPoint = new Object;//停止移动的坐标
    var x_x,y_y;//拖动差值
    var pointx , pointy;//当前对象的坐标
    var success;//判断答题是否成功
    var eq;//当前问题的下标志
    var title_num=0,right_num=0,wrong_num=0,score=0;
    var arr_point = [{x:5,y:190},{x:225,y:190},{x:5,y:400},{x:225,y:400}];
    var arr_img = [{x:30,y:193},{x:250,y:193},{x:30,y:403},{x:250,y:403}];
    var arr_n = new Array(),arr_sel1 = new Array(),arr_sel2 = new Array(),
        arr_sel3 = new Array(),arr_sel4 = new Array(),arr_ans1 = new Array(),
        arr_ans2 = new Array(),arr_ans3 = new Array(),arr_ans4 = new Array(),
        arr_curr1 = new Array(),arr_curr2 = new Array(),arr_curr3 = new Array(),
        arr_curr4  = new Array(),arr_ans1_mp3 = new Array(),arr_ans2_mp3 = new Array(),
        arr_ans3_mp3 = new Array(),arr_ans4_mp3 = new Array();
    var playx,playy;//播放器的初始坐标
    var lessonid = 1;//题库
    //function
    function loadData(xml){
        $.post(xml,{},function(data){
            $(data).find("title").each(function(){
                var n = $(this).children("no").text();
                var s1 = $(this).children("sel1").text();
                var s2 = $(this).children("sel2").text();
                var s3 = $(this).children("sel3").text();
                var s4 = $(this).children("sel4").text();
                var curr1 = $(this).children("sel1").attr("value");
                var curr2 = $(this).children("sel2").attr("value");
                var curr3 = $(this).children("sel3").attr("value");
                var curr4 = $(this).children("sel4").attr("value");
                var a1 = $(this).children("ans1").text();
                var a2 = $(this).children("ans2").text();
                var a3 = $(this).children("ans3").text();
                var a4 = $(this).children("ans4").text();
                var music1 = $(this).children("ans1").attr("value");
                var music2 = $(this).children("ans2").attr("value");
                var music3 = $(this).children("ans3").attr("value");
                var music4 = $(this).children("ans4").attr("value");
                arr_n.push(n);
                arr_sel1.push(s1);
                arr_sel2.push(s2);
                arr_sel3.push(s3);
                arr_sel4.push(s4);
                arr_ans1.push(a1);
                arr_ans2.push(a2);
                arr_ans3.push(a3);
                arr_ans4.push(a4);
                arr_curr1.push(curr1);
                arr_curr2.push(curr2);
                arr_curr3.push(curr3);
                arr_curr4.push(curr4);
                arr_ans1_mp3.push(music1);
                arr_ans2_mp3.push(music2);
                arr_ans3_mp3.push(music3);
                arr_ans4_mp3.push(music4);
            });
            $(".score p").text(score);
            $(".sel1").attr("value",arr_curr1[0]);
            $(".sel2").attr("value",arr_curr2[0]);
            $(".sel3").attr("value",arr_curr3[0]);
            $(".sel4").attr("value",arr_curr4[0]);
            $(".sel1 p").text(arr_sel1[0]);
            $(".sel2 p").text(arr_sel2[0]);
            $(".sel3 p").text(arr_sel3[0]);
            $(".sel4 p").text(arr_sel4[0]);
            $(".ans1").attr("value",arr_ans1_mp3[0]);
            $(".ans2").attr("value",arr_ans2_mp3[0]);
            $(".ans3").attr("value",arr_ans3_mp3[0]);
            $(".ans4").attr("value",arr_ans4_mp3[0]);
            $(".ans1 p").text(arr_ans1[0]);
            $(".ans2 p").text(arr_ans2[0]);
            $(".ans3 p").text(arr_ans3[0]);
            $(".ans4 p").text(arr_ans4[0]);
        });
    }

    function startEvent(e){
        dragging = true;
        if(SupportsTouches){
            e = event;
            e.preventDefault();
        }else{
            e = e;
        }
        startPoint=getMousePoint(e);
        pointx = parseInt($(this).css("left"),"px");
        pointy = parseInt($(this).css("top"),"px");
        $(this).attr("id","selected");
        $(this).next("div").addClass("selected");
        playx = parseInt($(".selected").css("left"),"px");
        playy = parseInt($(".selected").css("top"),"px");
    }

    function endEvent(e){
        dragging = false;
        var $sel = $(".sel:eq("+eq+")");
        var $ans;
        if(success&&!$sel.attr("id")){
            $sel.attr("id","answered");
            $("#selected").css({"left":arr_point[eq]["x"],"top":arr_point[eq]["y"]});
            $(".selected").css({"left":arr_img[eq]["x"],"top":arr_img[eq]["y"]});
            $(".ans").each(function(i){
                if($(this).attr("id") == "selected"){
                    $ans = $(".ans:eq("+i+")");
                }
            });
            checkAns($sel,eq,$ans);
            $(".ans").removeAttr("id");
            $(".selected").removeClass("selected");

        }else{
            $("#selected").removeAttr("style");
            $(".ans").removeAttr("id");
            $(".selected").removeAttr("style");
            $(".selected").removeClass("selected");
        }
    }

    function moveEvent(e){
        if(SupportsTouches){
            e = event;
            e.preventDefault();
        }else{
            e = e;
        }
        nowPoint = getMousePoint(e);
        if(dragging){
            x_x =  nowPoint.x - startPoint.x + pointx;
            y_y = nowPoint.y - startPoint.y + pointy;
            var play_x = nowPoint.x - startPoint.x + playx;
            var play_y = nowPoint.y - startPoint.y + playy;
            $("#selected").css({"left":x_x,"top":y_y});
            $(".selected").css({"left":play_x,"top":play_y});
            var a = hitText();//a代表当前问题框的下标
        }
    }

    function hitText(){
        $(".sel").each(function(i){
            var tmp_x1 = $(this).position().left;
            var tmp_y1 = $(this).position().top;
            var tmp_x2 = tmp_x1+200;
            var tmp_y2 = tmp_y1+100;
            if(x_x>tmp_x1&&x_x<tmp_x2&&y_y>tmp_y1&&y_y<tmp_y2&&!$(this).attr("id")){
                $(this).css("border","3px dashed orange");
                success = true;
                eq = i;
                return false;
            }else{
                success = false;
                //$(this).removeAttr("style");//导致问题框的背景也改变了
                $(this).css("border","0px dashed orange");
            }
        });
        return eq;
    }

    function checkAns($sel,eq,$ans){
        var top = (eq+1)>=3 ? "270px":"60px";
        $ans.unbind(StartEvent);
        $ans.unbind(MoveEvent);
        $ans.unbind(EndEvent);
        $sel.css("border","0px dashed orange");
        if($sel.attr("value") === $("#selected").text()){
            $sel.css({"background-image":"url(img/q"+(eq+1)+"_r.png)","top":top,"height":"230px"});
            $sel.children("p").css("padding-top","150px");
            right_num++;
            if(right_num==4){
                $("#jpId1").jPlayer("pause");//解决上一题的音频还在播放，导致下一题的音频不能切换
                $("#jpId2").jPlayer("pause");
                $("#jpId3").jPlayer("pause");
                $("#jpId4").jPlayer("pause");
                score = score +10;//打对一道大题加十分
                $(".score p").text(score);//更新下一题的分数板、问题、答案
                $(".sel1").attr("value",arr_curr1[title_num+1]);
                $(".sel2").attr("value",arr_curr2[title_num+1]);
                $(".sel3").attr("value",arr_curr3[title_num+1]);
                $(".sel4").attr("value",arr_curr4[title_num+1]);
                $(".sel1 p").text(arr_sel1[title_num+1]);
                $(".sel2 p").text(arr_sel2[title_num+1]);
                $(".sel3 p").text(arr_sel3[title_num+1]);
                $(".sel4 p").text(arr_sel4[title_num+1]);
                $(".ans1 p").text(arr_ans1[title_num+1]);
                $(".ans2 p").text(arr_ans2[title_num+1]);
                $(".ans3 p").text(arr_ans3[title_num+1]);
                $(".ans4 p").text(arr_ans4[title_num+1]);
                $(".ans1").attr("value",arr_ans1_mp3[title_num+1]);
                $(".ans2").attr("value",arr_ans2_mp3[title_num+1]);
                $(".ans3").attr("value",arr_ans3_mp3[title_num+1]);
                $(".ans4").attr("value",arr_ans4_mp3[title_num+1]);
                $(".sel").removeAttr("style");
                $(".sel").removeAttr("id");
                $(".ans").removeAttr("style");
                $(".ans").removeAttr("id");
                $(".sel p").removeAttr("style");
                $(".ans").bind(StartEvent,startEvent).bind(EndEvent,endEvent).bind(MoveEvent,moveEvent);
                $("#container1").removeAttr("style");
                $("#container2").removeAttr("style");
                $("#container3").removeAttr("style");
                $("#container4").removeAttr("style");
                title_num++;
                right_num=0;//清空每道大题的答对记录
                if(title_num==arr_n.length){
                    $(".scene_end .sum p").text(score);
                    $(".scene_play").css("display","none");
                    $(".scene_end").css("display","block");
                    loadData("xml/1.xml");
                }
            }
        }else{
            $sel.css({"background-image":"url(img/q"+(eq+1)+"_w.png)","top":top,"height":"230px"});
            $sel.children("p").css("padding-top","150px");
            setTimeout(function(){
                $sel.removeAttr("style");
                $sel.removeAttr("id");
                $sel.children("p").css("padding-top","115px");
                $ans.removeAttr("style");
                $ans.removeAttr("id");
                $ans.next("div").removeAttr("style");
                $ans.bind(StartEvent,startEvent);
                $ans.bind(EndEvent,endEvent);
                $ans.bind(MoveEvent,moveEvent);
            },2000);
            wrong_num++;//答错记录，没完成
        }
        success = false;
    }

    var getMousePoint = function(ev){
        var x = y = 0,
            doc = document.documentElement,
            body = document.body;
        if(!ev) ev=window.event;
        if (window.pageYoffset) {
            x = window.pageXOffset;
            y = window.pageYOffset;
        }else{
            x = (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
            y = (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
        }
        if(SupportsTouches){
            var evt = ev.touches.item(0);//仅支持单点触摸,第一个触摸点
            x=evt.pageX;
            y=evt.pageY;
        }else{
            x += ev.clientX;
            y += ev.clientY;
        }
        return {'x' : x, 'y' : y};
    };

    function playSound(){
        $("#jpId1").jPlayer({
            ready:function(){
                $(this).jPlayer("setMedia",{
                    mp3:"sound/"+lessonid+"/"+$(".ans1").val()
                });
                //$("#container1").find("img").bind("click");
            },
            setPath:"",
            cssSelectorAncestor:"#container1",
            cssSelector:{
                play:".play1",
                pause:".pause1"
            }
        });
        $("#jpId2").jPlayer({
            ready:function(){
                $(this).jPlayer("setMedia",{
                    mp3:"sound/"+lessonid+"/"+$(".ans2").val()
                });
               // $("#container2").find("img").bind("click");
            },
            setPath:"",
            cssSelectorAncestor:"#container2",
            cssSelector:{
                play:".play2",
                pause:".pause2"
            }
        });
        $("#jpId3").jPlayer({
            ready:function(){
                $(this).jPlayer("setMedia",{
                    mp3:"sound/"+lessonid+"/"+$(".ans3").val()
                });
                //$("#container3").find("img").bind("click");
            },
            setPath:"",
            cssSelectorAncestor:"#container3",
            cssSelector:{
                play:".play3",
                pause:".pause3"
            }
        });
        $("#jpId4").jPlayer({
            ready:function(){
                $(this).jPlayer("setMedia",{
                    mp3:"sound/"+lessonid+"/"+$(".ans4").val()
                });
                //$("#container4").find("img").bind("click");
            },
            setPath:"",
            cssSelectorAncestor:"#container4",
            cssSelector:{
                play:".play4",
                pause:".pause4"
            }
        });
    }

    function eyeAnimate1(element,position,time){
        $(element).animate({backgroundPosition:position},time,function(){
            $(this).animate({backgroundPosition: "0 0"},2*time,function(){
                $(this).animate({backgroundPosition:position},4*time,function(){
                    $(this).animate({backgroundPosition:"0 0"},6*time);
                });
            });
        })
    }

    function eyeAnimate2(element,position,time){
        $(element).animate({backgroundPosition:position},5*time,function(){
            $(this).animate({backgroundPosition: "0 0"},55*time);
        })
    }

    //preset


    loadData("xml/1.xml");

    setInterval(function(){
        eyeAnimate2(".sel1","-211px 0",50);
    },12000);
    setInterval(function(){
        eyeAnimate1(".sel2","-211px 0",50);
    },8000);
    setInterval(function(){
        eyeAnimate1(".sel3","-211px 0",50);
    },10000);
    setInterval(function(){
        eyeAnimate2(".sel4","-211px 0",50);
    },8000);

    playSound();

    //playing game
    $(document).bind("selectstart",function(){return false;}); //禁止文本选定

    $(".btn_begin").hover(function(){
        $(this).css("background-image","url(img/btn_start_o.png)");
    },function(){
        $(this).css("background-image","url(img/btn_start.png)");
    });
    $(".btn_begin").click(function(){
        $(".scene_begin").css("display","none");
        $(".scene_play").css("display","block");
    });

    $(".point").mouseover(function(e){
        $(this).css("cursor","pointer");
    });

    $(".mark").hover(function(){
        $(this).css("background","transparent url(img/btn_record_o.png) no-repeat 0 0");
    },function(){
        $(this).css("background","transparent url(img/btn_record.png) no-repeat 0 0");
    });
    $(".mark").click(function(){
        var a = window.confirm("提交後不能重做，確定提交？");
        if(a){
            $.ajax({
                url:save_path,
                type:"post",
                data: {lesson_id:lesson_id, game_id:game_id,score:score.text,ansJson:json_str},
                error:function(xmlHttpRequest, textStatus, errorThrown){
                    alert("提交失败！");
                },
                success:function(data){
                    if(data.indexOf("success")>-1){
                        alert("保存成績成功！");
                    }else{
                        alert("保存成績失敗！");
                    }
                    $(".scene_begin").css("display","block");
                    $(".scene_play").css("display","none");
                    $(".scene_end").css("display","none");
                    title_num=right_num=wrong_num=score=0;
                }
            });
        }else{
            $(".scene_begin").css("display","block");
            $(".scene_play").css("display","none");
            $(".scene_end").css("display","none");
            title_num=right_num=wrong_num=score=0;
        }
    });
    $(".again").hover(function(){
        $(this).css("background","transparent url(img/btn_replay_o.png) no-repeat 0 0");
    },function(){
        $(this).css("background","transparent url(img/btn_replay.png) no-repeat 0 0");
    });
    $(".again").click(function(){
        $(".scene_begin").css("display","block");
        $(".scene_play").css("display","none");
        $(".scene_end").css("display","none");
        title_num=right_num=wrong_num=score=0;
    });

    $(".ans").mouseover(function(e){
        $(this).css("cursor","move");
    }).bind(StartEvent,startEvent);
    $("#wrap").bind(MoveEvent,moveEvent);
    $(".ans").bind(EndEvent,endEvent);
    $(document).bind(EndEvent,endEvent);
});
