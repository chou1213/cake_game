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
        arr_curr4  = new Array();
    var playx,playy;//播放器的初始坐标
    var lessonid = 1;
    var m,s,i = 60;//计时器
    var timer_switch=true,clear_timer;
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
        $("#selected").css("z-index","10");
        $(".selected").css("z-index","10");
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
                $(".sel").css("border","0px dashed orange");
                $(this).css("border","3px dashed orange");
                success = true;
                eq = i;
                return false;
            }else{
                success = false;
                $(this).removeAttr("style");//导致问题框的背景也改变了
                $(this).css("border","0px dashed orange");
            }
        });
        return eq;
    }

    function checkAns($sel,eq,$ans){
        var top = (eq+1)>=3 ? "270px":"60px";
        if((eq+1)>=3){
            $ans.css("z-index","2");
            $ans.next("div").css("z-index","3");
            $sel.css("z-index","1");
        }else{
            $ans.css("z-index","0");
            $ans.next("div").css("z-index","0");
        }
        $ans.unbind(StartEvent);
        $ans.unbind(MoveEvent);
        $ans.unbind(EndEvent);
        $sel.css("border","0px dashed orange");
        if($sel.attr("value") === $("#selected").text()){
            $sel.css({"background-image":"url(img/q"+(eq+1)+"_r.png)","top":top,"height":"230px"});
            $sel.children("p").css("padding-top","150px");
            $ans.bind("mouseover",function(){
                $(this).css("cursor","default");
            });
            right_num++;
            if(right_num==4){
                $("#jpId1").jPlayer("stop");
                $("#jpId2").jPlayer("stop");
                $("#jpId3").jPlayer("stop");
                $("#jpId4").jPlayer("stop");
                score = score +10;
                $(".score p").text(score);
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
                /*$(".ans1").attr("value",arr_ans1_mp3[title_num+1]);
                $(".ans2").attr("value",arr_ans2_mp3[title_num+1]);
                $(".ans3").attr("value",arr_ans3_mp3[title_num+1]);
                $(".ans4").attr("value",arr_ans4_mp3[title_num+1]);*/
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
                $(".ans").bind("mouseover",function(){
                    $(this).css("cursor","move");
                });
                //alert("下一题");
                title_num++;
                right_num=0;
                $("#jpId1").jPlayer("setMedia",{                      //换下一题mp3的路径
                    mp3:"sound/"+lessonid+"/"+(title_num+1)+"_1.mp3"
                });
                $("#jpId2").jPlayer("setMedia",{
                    mp3:"sound/"+lessonid+"/"+(title_num+1)+"_2.mp3"
                });
                $("#jpId3").jPlayer("setMedia",{
                    mp3:"sound/"+lessonid+"/"+(title_num+1)+"_3.mp3"
                });
                $("#jpId4").jPlayer("setMedia",{
                    mp3:"sound/"+lessonid+"/"+(title_num+1)+"_4.mp3"
                });
                if(title_num==arr_n.length){
                    clearInterval(clear_timer);
                    //$(".scene_end .sum p").text(score);
                    //$(".scene_end .sum p").text(score+"("+$(".min").text()+":"+$(".sec").text()+")");
                    $(".scene_end .sum p").text($(".min").text()+":"+$(".sec").text());
                    $(".scene_play").css("display","none");
                    $(".scene_end").css("display","block");
                }
            }
        }else{
            $sel.css({"background-image":"url(img/q"+(eq+1)+"_w.png)","top":top,"height":"230px"});
            $sel.children("p").css("padding-top","150px");
            $ans.bind("mouseover",function(){
                $(this).css("cursor","default");
            });
            setTimeout(function(){
                $sel.removeAttr("style");
                $sel.removeAttr("id");
                $sel.children("p").css("padding-top","115px");
                $ans.removeAttr("style");
                $ans.removeAttr("id");
                $ans.bind("mouseover",function(){
                    $(this).css("cursor","move");
                });
                $ans.next("div").removeAttr("style");
                $ans.bind(StartEvent,startEvent);
                $ans.bind(EndEvent,endEvent);
                $ans.bind(MoveEvent,moveEvent);
            },2000);
            wrong_num++;
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

    function playSound(lessonid,i){
        $("#jpId1").jPlayer({
            ready:function(){
                $(this).jPlayer("setMedia",{
                    mp3:"sound/"+lessonid+"/"+i+"_1.mp3"
                });
            },
            setPath:"",
            cssSelectorAncestor:"#container1",
            cssSelector:{
                play:".play1",
                pause:".pause1"
            },
            play:function(){
                $("#jpId2").jPlayer("stop");
                $("#jpId3").jPlayer("stop");
                $("#jpId4").jPlayer("stop");
            }
        });
        $("#jpId2").jPlayer({
            ready:function(){
                $(this).jPlayer("setMedia",{
                    mp3:"sound/"+lessonid+"/"+i+"_2.mp3"
                });
            },
            setPath:"",
            cssSelectorAncestor:"#container2",
            cssSelector:{
                play:".play2",
                pause:".pause2"
            },
            play:function(){
                $("#jpId1").jPlayer("stop");
                $("#jpId3").jPlayer("stop");
                $("#jpId4").jPlayer("stop");
            }
        });
        $("#jpId3").jPlayer({
            ready:function(){
               $(this).jPlayer("setMedia",{
                    mp3:"sound/"+lessonid+"/"+i+"_3.mp3"
               });
            },
            setPath:"",
            cssSelectorAncestor:"#container3",
            cssSelector:{
                play:".play3",
                pause:".pause3"
            },
            play:function(){
                $("#jpId1").jPlayer("stop");
                $("#jpId2").jPlayer("stop");
                $("#jpId4").jPlayer("stop");
            }
        });
        $("#jpId4").jPlayer({
            ready:function(){
                $(this).jPlayer("setMedia",{
                    mp3:"sound/"+lessonid+"/"+i+"_4.mp3"
                });
            },
            setPath:"",
            cssSelectorAncestor:"#container4",
            cssSelector:{
                play:".play4",
                pause:".pause4"
            },
            play:function(){
                $("#jpId1").jPlayer("stop");
                $("#jpId2").jPlayer("stop");
                $("#jpId3").jPlayer("stop");
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

    function clock(){
        m = $(".min").text();
        s = $(".sec").text();
        if(m > 0){
            if(s > 0){
                $(".sec").text(i);
                i--;
                setTimeout(clock,1000);
            }else if(s == 0){
                i = 60;
                $(".min").text("0");
                $(".sec").text("60");
                setTimeout(clock,1000);
            }
        }else{
            if(s > 0){
                $(".sec").text(i);
                i--;
                setTimeout(clock,1000);
            }else if(s == 0){
                $("#jpId1").jPlayer("stop");
                $("#jpId2").jPlayer("stop");
                $("#jpId3").jPlayer("stop");
                $("#jpId4").jPlayer("stop");
                $(".scene_play").css("display","none");
                $(".scene_begin").css("display","none");
                $(".scene_end").css("display","block");
                $(".sum p").text(score);

            }
        }
    }

    function timer(){
        var s = $(".sec").text();
        var m = $(".min").text();
        if(s<60){
            s++;
            $(".sec").text(s);
        }else if(s==60){
            m++;
            s=0;
            $(".sec").text(s);
            $(".min").text(m);
        }
    }
    //preset
    loadData("xml/"+lessonid+".xml");
    playSound(lessonid,1);
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
    $(".point").mouseover(function(e){
        $(this).css("cursor","pointer");
    });

    //playing game
    $(document).bind("selectstart",function(){return false;}); //禁止文本选定
    $(".btn_begin").hover(function(){
        $(this).css("background-image","url(img/btn_start_o.png)");
    },function(){
        $(this).removeAttr("style");
    });
    $(".btn_begin").click(function(){
        $(".scene_play").css("display","block");
        $(".scene_begin").css("display","none");
        $(".scene_end").css("display","none");
        $(".ans").mouseover(function(){
            $(this).css("cursor","move");
        });
        //$(".min").text("1");
        //$(".sec").text("60");
        //i=60;
        //clock();//计时开始
        $(".min").text("0");
        $(".sec").text("0");
        if(timer_switch){
            clear_timer = setInterval(timer,1000);
            timer_switch = false;
        }
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
                    window.location.reload();
                }
            });
        }else{
            $(".scene_begin").css("display","block");
            $(".scene_play").css("display","none");
            $(".scene_end").css("display","none");
            window.location.reload();
        }
    });
    $(".again").hover(function(){
        $(this).css("background","transparent url(img/btn_replay_o.png) no-repeat 0 0");
    },function(){
        $(this).css("background","transparent url(img/btn_replay.png) no-repeat 0 0");
    });
    $(".again").click(function(){
        window.location.reload();
    });

    $(".ans").bind(StartEvent,startEvent);
    $("#wrap").bind(MoveEvent,moveEvent);
    $(".ans").bind(EndEvent,endEvent);
    $(document).bind(EndEvent,endEvent);

    //预加载图片
    var t1,t2,t3,t4,t5,t6,t7,t8,t9,t10,t11,t12,t13,t14,t15,t16,t17;
    function loadImg(url1,url2,url3,url4,url5,url6,url7,url8,url9,url10,url11,url12,url13,url14,url15,url16,url17){
        var img1 = new Image();
        var img2 = new Image();
        var img3 = new Image();
        var img4 = new Image();
        var img5 = new Image();
        var img6 = new Image();
        var img7 = new Image();
        var img8 = new Image();
        var img9 = new Image();
        var img10 = new Image();
        var img11 = new Image();
        var img12 = new Image();
        var img13 = new Image();
        var img14 = new Image();
        var img15 = new Image();
        var img16 = new Image();
        var img17 = new Image();
        img1.src = url1;
        img2.src = url2;
        img3.src = url3;
        img4.src = url4;
        img5.src = url5;
        img6.src = url6;
        img7.src = url7;
        img8.src = url8;
        img9.src = url9;
        img10.src = url10;
        img11.src = url11;
        img12.src = url12;
        img13.src = url13;
        img14.src = url14;
        img15.src = url15;
        img16.src = url16;
        img17.src = url17;
        img1.onload = function(){
            t1 = true;
        }
        img2.onload = function(){
            t2 = true;
        }
        img3.onload = function(){
            t3 = true;
        }
        img4.onload = function(){
            t4 = true;
        }
        img5.onload = function(){
            t5 = true;
        }
        img6.onload = function(){
            t6 = true;
        }
        img7.onload = function(){
            t7 = true;
        }
        img8.onload = function(){
            t8 = true;
        }
        img9.onload = function(){
            t9 = true;
        }
        img10.onload = function(){
            t10 = true;
        }
        img11.onload = function(){
            t11 = true;
        }
        img12.onload = function(){
            t12 = true;
        }
        img13.onload = function(){
            t13 = true;
        }
        img14.onload = function(){
            t14 = true;
        }
        img15.onload = function(){
            t15 = true;
        }
        img16.onload = function(){
            t16 = true;
        }
        img17.onload = function(){
            t17 = true;
        }
    }
    var clear = setInterval(check,10);
    function check(){
        if(t1&&t2&&t3&&t4&&t5&&t6&&t7&&t8&&t9&&t10&&t11&&t12&&t13&&t14&&t15&&t16&&t17){
            $("#box").removeAttr("style");
            $("#box p").text("");
            clearInterval(clear);
        }
    }
    loadImg("img/q1.png","img/q1_r.png","img/q2.png","img/q2_r.png","img/q3.png","img/q3_r.png",
        "img/q4.png","img/q4_r.png","img/q1_w.png","img/q2_w.png","img/q3_w.png","img/q4_w.png",
        "img/drag_ans1.png","img/drag_ans2.png","img/drag_ans3.png","img/drag_ans4.png","img/bg_score_c.png");
    /************************************************/
    $(document).mousemove(function(e){ //检查坐标的值
        var tmp = getMousePoint(e);
        $("#test").text(tmp.x+","+tmp.y);
    });
});