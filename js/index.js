var playState = {
    // musicSum:tracks.length, //  这里的tracks是datajs中的数据
    musicSum:musicList && musicList.length,
    currentPlay:0,
    currentTime:0,
    currentTotalTime:0,
    playStatus:false,
    randomPlay:false,
    volumeStatus:true,
};
var timer;// 全局的定时器，用来控制进度条，以及时间的切换

//格式化时间函数
function timeFormat(timestamp){
    var minute = Math.floor(timestamp/60);
    var second = Math.floor(timestamp - minute * 60);
    if(minute<10){
        minute = '0'+minute;
    };
    if(second<10){
        second = '0'+second;
    }
    var ultime = minute + ':' + second;
    return ultime;
};

var playerControl = {
        baseInfo: function(args){   // 传入的参数是做为保留使用的，也就是说当前可以传入某个音乐对象就此刻没有加载出来的，例如搜索得到的
            // var muiscObj = tracks[playState.currentPlay];   // 这里也是datajs中的数据
            // var argsObj = args || {
            //     name:muiscObj.name,
            //     artists:muiscObj.artists[0].name,
            //     albumPic:muiscObj.album.picUrl,
            //     album:muiscObj.album.name,
            //     total:muiscObj.duration,
            //     musicSrc:muiscObj.mp3Url,
            // };
            var muiscObj = musicList[playState.currentPlay];  
            var argsObj = args || {
                name:muiscObj.name,
                artists:muiscObj.singer,
                albumPic:muiscObj.pic,
                total:muiscObj.time,
                musicSrc:muiscObj.url,
                lrcUrl:muiscObj.lrc,
            };
            lrcAjax(argsObj.lrcUrl);

            $('.musicName').text(argsObj.name);
            $('.singer').text(argsObj.artists);
            // $('.pic').css('background-image','url('+ argsObj.albumPic +')');
            $('.pic img').attr('src',''+ argsObj.albumPic +'');
            // $('.total').text(timeFormat((argsObj.total)/1000));
            $('.total').text(timeFormat(argsObj.total));
            $('#voice').attr('src',argsObj.musicSrc);
            // playState.currentTotalTime = Math.floor((argsObj.total)/1000);
            playState.currentTotalTime = Math.floor(argsObj.total);
        },

        playerStatus:function(){    //  播放状态函数
            $('.pause-play img').attr('src','./img/'+(playState.playStatus?'play':'pause')+'.svg');
            $('.panel_list_ul li').eq(playState.currentPlay).addClass('active').siblings().removeClass('active');
            $('.panel_list_ul').scrollTop((+playState.currentPlay)*25-50);
            if(playState.playStatus){
                timer && clearInterval(timer);
                $('#voice')[0].play();
                timer=setInterval(function(){
                    playState.currentTime = $('#voice')[0].currentTime ;
                    playerControl.currentTime();
                    lyricsScroll($('#voice')[0].currentTime);
                    if(playState.currentTime >= playState.currentTotalTime){
                        $('.next').trigger('click');
                    };
            
                },500);
            }else{
                timer && clearInterval(timer);
                $('#voice')[0].pause();
            }
        },

        currentTime:function(){     //进度条以及当前时间播放时间的显示函数
            $('.current').text(timeFormat(playState.currentTime));
            $('.progress-bar').css('width',playState.currentTime/playState.currentTotalTime*100+'%');
        }
};

// 切换音乐操作的函数
function switcher(){
    $('#voice')[0].pause();     // 先暂停当前音乐播放
    playerControl.baseInfo();   // 重新配置播放基本信息
    playState.playStatus = true;//这里一直在考虑暂停播放的时候切换歌曲后要不要自动播放
    playerControl.playerStatus();   // 根据配置条件做相关状态的显示变换操作等
};
// 随机播放函数
function stochastic(min,max){
    var range = Math.abs(max-min);
    var result = min + Math.floor(range*Math.random());
    return result;
};
// 歌词滚动
function lyricsScroll(time){
    var timer = parseInt(time);
    if(timer===undefined ) return ;
    if( playState.lrcTime==timer) return;
    for(kmin in playState.lyrics){
        if(kmin==timer){
            playState.lrcTime = kmin;
            $('.lrc_ul_item[data-time="'+timer+'"]').addClass('lyric_li_active').siblings().removeClass('lyric_li_active');
            var scollY = $('.lrc_ul_item[data-time="'+timer+'"]')[0].offsetTop;
            $('#lyric').css('transform','translate(0,-'+(scollY-30)+'px)')
        }
    };
};

function initMusicPlayer(){
    // 初始化基本信息和播放状态
    playerControl.baseInfo();
    playerControl.playerStatus();

    // 暂停-播放按钮点击事件
    $('.pause-play').on('click',function(){
        playState.playStatus = !playState.playStatus;
        playerControl.playerStatus();
    });
    // 上一首按钮点击事件
    $('.previous').on('click',function(){
        if(playState.randomPlay){
            playState.currentPlay = stochastic(0,playState.musicSum);
            switcher();
        }else{
            if(playState.currentPlay-1<0){
                playState.currentPlay = playState.musicSum-1;
                switcher();
            }else{
                playState.currentPlay--;
                switcher();
            };
        };
    });
    // 下一首按钮点击事件
    $('.next').on('click',function(){
        if(playState.randomPlay){
            playState.currentPlay = stochastic(0,playState.musicSum);
            switcher();
        }else{
            if(playState.currentPlay+1>=playState.musicSum){
                playState.currentPlay = 0;
                switcher();
            }else{
                playState.currentPlay++;
                switcher();
            };
        };
    });
    // 顺序播放按钮点击事件
    $('.order_random').on('click',function(){
        playState.randomPlay = !playState.randomPlay;
        $('.order_random img').attr('src','./img/'+(playState.randomPlay?'random':'sequence')+'.svg');
    });
    // 静音按钮点击事件
    $('#mute-sonic').on('click',function(){
        playState.volumeStatus = !playState.volumeStatus;
        $('#mute-sonic').attr('src','./img/'+(playState.volumeStatus?'volume_down':'volume_mute')+'.svg')
        if(playState.volumeStatus){
            $('.volume_bar_core').show();
            $('#voice')[0].volume=parseFloat($('.volume_bar_core').width()/$('.volume_bar_box').width());
        }else{
            $('.volume_bar_core').hide();
            $('#voice')[0].volume=0;
        }
    });
    // 播放进度选择事件
    $('.progress').on('click',function(e){
        console.log(e)
        var pointNum = e.offsetX;
        $('.progress-bar').width(pointNum);
        playState.currentTime = $('#voice')[0].currentTime = parseInt(pointNum/$('.progress').width()*playState.currentTotalTime);
        lyricsScroll($('#voice')[0].currentTime);
        playerControl.currentTime();
    });
    // 音量大小选择事件
    $('.volume_bar_box').on('click',function(e){
        var pointNum = e.offsetX;
        $('.volume_bar_core').width(pointNum);
        $('#voice')[0].volume = parseFloat(pointNum/$('.volume_bar_box').width());   
    });
    // 更多菜单点击事件
    $('.menus_list').on('click',function(){
        $('.panel_list').css('visibility','visible');
        $('.panel_list').addClass('bounceInUp');
        $('.panel_list').removeClass('bounceOutDown');
    });
    // 歌曲列表下边关闭按钮点击事件
    $('.panel_list_close').on('click',function(){
        $('.panel_list').addClass('bounceOutDown');
        $('.panel_list').removeClass('bounceInUp');
        $('.panel_list').css('visibility','hidden');
    });
    // 歌曲列表选择事件
    $('.panel_list_ul').on('click','li',function(e){
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        playState.currentPlay = +$(this).attr('data-index');
        switcher();
    });
    $('#voice')[0].addEventListener('error',function(){
        $('.next').trigger('click');
        // 暂时的错误处理就播下一曲吧，感觉应该有很多东西需要处理，这里只是简单的播放下一个，至少应该记录一下以后不在播放这个
    });
    $('#pic_img').error(function(){
        $(this).attr('src','./img/bar_chart.svg');
    })
}