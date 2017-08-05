console.log('hello 朋友，感谢您阅读简历代码,如果您有什么建议或者想入门前端，欢迎扫二维码加入我们,我们互相学习.');
function showPic(e, sUrl) {
    var x = e.clientX;
    var y = e.clientY;
    console.dir(e);
    document.getElementById("Layer1").style.left = x -200 + 'px';
    document.getElementById("Layer1").style.top = y -100 + 'px';
    document.getElementById("Layer1").style.fontSize = 20+ 'px';
    document.getElementById("Layer1").style.color = 'black';
    document.getElementById("Layer1").innerHTML = "扫码加入南京前端分享 <img style='height:200px' border='0' src=" + sUrl + ">";
    document.getElementById("Layer1").style.display = "";
}

function hiddenPic() {
    document.getElementById("Layer1").innerHTML = "";
    document.getElementById("Layer1").style.display = "none";
}
