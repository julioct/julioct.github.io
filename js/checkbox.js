function check(element) {
    
    var checkBox = element;
    var text1 = document.getElementsByClassName("text1");
    var text2 = document.getElementsByClassName("text2");

    if (checkBox == null || !checkBox.checked) {
        for (var i = 0; i < text2.length; i++) {
            text1[0].style.display = "none";
            text2[i].style.display = "block";
        }
    } else {
        for (var i = 0; i < text2.length; i++) {
            text1[0].style.display = "block";
            text2[i].style.display = "none";
        }
    }
}

check();