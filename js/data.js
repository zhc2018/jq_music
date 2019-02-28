// var tracks = [
//     {
//         "name": "元日",
//         "artists": [
//             {
//                 "name": "于文华",
//             }
//         ],
//         "album": {
//             "name": "国学唱歌集",
//             "picUrl": "http://p3.music.126.net/SR9eFEjRB0NsscxN7-fHMw==/3344714372906000.jpg",
//         },
//         "duration": 136829,
//         // "mp3Url": "http://m2.music.126.net/rUcfqqZbq7TIfJeAHfTrkw==/3376600210116829.mp3"
//         "mp3Url": "./public/kiss the rain.mp3"
//     },
//     {
//         "name": "元日 ",
//         "artists": [
//             {
//                 "name": "清弄",
//             }
//         ],
//         "album": {
//             "name": "热门华语261",
//             "picUrl": "http://p4.music.126.net/ly2FJHh5-lYMdC3NZxvavQ==/7714173580661848.jpg",
//         },
//         "duration": 109000,
//         // "mp3Url": "http://m2.music.126.net/jwwZVlWJ78HEarft42uKUQ==/7906588115920636.mp3"
//         "mp3Url": "./public/kiss the rain.mp3"
//     },
//     {
//         "name": "青龙·花木苍苍",
//         "artists": [
//             {
//                 "name": "五色石南叶",
//             }
//         ],
//         "album": {
//             "name": "热门华语234",
//             "picUrl": "http://p4.music.126.net/tHAfnugCElS93EDp5cHLIw==/8909342719897560.jpg",
//         },
//         "duration": 295575,
//         // "mp3Url": "http://m2.music.126.net/rnq_W32zFX_utQbBhE0xkg==/8934631487358481.mp3"
//         "mp3Url": "./public/kiss the rain.mp3"
//     }
// ];

var musicList;
var $lyric = $('#lyric');
$.ajax({
    type:'GET',
    url:'https://api.bzqll.com/music/netease/songList',
    data:{key:'579621905',id:'3778678'}
}).done(function(data){
    musicList=data.data.songs;
    var html = template('temp',{musicList});
    $('.panel_list_ul').html(html);
}).then(function(){
    initMusicPlayer();
});

function lrcAjax(lrc){
    $.ajax({
        type:'GET',
        url:lrc,
        headers:{
            contentType:"application/x-www-form-urlencoded"
        },
        dataType:'text',  //请求lrc文件需要返回的文件格式为text才能走成功

    }).done(function(data){
        var lyricObj = parseLyric(data);
        playState.lyrics=lyricObj;
        if(lyricObj==='') {     //返回的是是个字符串的时候
            $lyric.html('<li class="lyric_li_active">没有歌词</li>');
            return;
        }
        $lyric.empty();     //  清空歌词区域；
        $('#lyric').css('transform','translate(0,0)');
        $lyric.html(template('lyricTemp',{lyricObj}));
       
    });
};


//  网上找的。解析歌词，参数：原始歌词文件
function parseLyric(lrc) {
    if(lrc === '') return '';
    var lyrics = lrc.split("\n");
    var lrcObj = {};
    for(var i=0;i<lyrics.length;i++){
        var lyric = decodeURIComponent(lyrics[i]);
        var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
        var timeRegExpArr = lyric.match(timeReg);
        if(!timeRegExpArr)continue;
        var clause = lyric.replace(timeReg,'');
        for(var k = 0,h = timeRegExpArr.length;k < h;k++) {
            var t = timeRegExpArr[k];
            var min = Number(String(t.match(/\[\d*/i)).slice(1)),
                sec = Number(String(t.match(/\:\d*/i)).slice(1));
            var time = min * 60 + sec;
            lrcObj[time] = clause;
        }
    }
    return lrcObj;
}