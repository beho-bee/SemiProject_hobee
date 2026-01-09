// 회원 가입 페이지


// 유효성 검사
// 유효하면 true
// 유효하지 않으면 false
const checkObj = {
    "authEmail"       : false,
    "memberId"        : false,
    "authKey"         : false,
    "memberPw"        : false,
    "memberPwConfirm" : false,
    "memberName"      : false,
    "memberNickname"  : false,
    "memberTel"       : false
};




// 이메일 ---------------------------------------------------------------------------------------------------------------------
const authEmail = document.querySelector("#memberEmail");     // 이메일
const emailMessage = document.querySelector("#emailMessage");   // 이메일 span 메세지 

// 타이머 초기값(초기화)
let authTimer; // 타이머 역할을 할 setInterval을 저장할 변수

const initMin = 4; // 타이머 초기값 (분)
const initSec = 59; // 타이머 초기값 (초)
const initTime = "05:00";

// 실제 줄어드는 시간을 저장할 변수
let min = initMin;
let sec = initSec;


authEmail.addEventListener("input", e => {

    const inputEmail = e.target.value; // 입력된 값 가져오기

    // 1) 입력된 이메일이 없을 경우
    if(inputEmail.trim().length === 0) {
        emailMessage.innerText = "메일을 받을 수 있는 이메일을 입력해주세요.";
        emailMessage.classList.remove('confirm', 'error');
        checkObj.authEmail = false;
        return;
    }

    // 2) 이메일 정규표현식 유효성 ,중복 검사
    const regExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if(regExp.test(inputEmail)) { // 유효한 경우
        
        fetch("/member/checkEmail?memberEmail="+inputEmail) 
        // ex)http://localhost/member/checkEmail?memberEmail=abc@test.com 단순 DB조회라 GET방식 커리스트링 이용 ,즉 파람으로 갖고 오기 위해
        .then(resp => resp.text()) // text로 받은 이유 단순 이메일 문자라 String으로 받음
        .then(count =>{
            if(count == 0){
                emailMessage.innerText = "사용 가능한 이메일입니다.";
                emailMessage.classList.add('confirm');
                emailMessage.classList.remove('error');
                checkObj.authEmail = true; // 형식 o / 중복 x
            }
            else{
                emailMessage.innerText = "이미 사용 중인 이메일입니다.";
                emailMessage.classList.add('error');
                emailMessage.classList.remove('confirm');
                checkObj.authEmail = false;
                checkObj.authKey = false;
            }
        })
        
    }else{
        emailMessage.innerText = "알맞은 이메일 형식으로 작성해주세요.";
        emailMessage.classList.add('error');
        emailMessage.classList.remove('confirm');
        checkObj.authEmail = false;
        checkObj.authKey = false;
    }
   
    
});

// 인증 코드 보내기 ------------------------------------------------------------------------------------
const sendAuthKeyBtn = document.querySelector("#sendAuthKeyBtn"); // 인증번호 받기 버튼
const authKeyMessage = document.querySelector("#authKeyMessage"); // 인증 span 메세지

sendAuthKeyBtn.addEventListener("click",()=>{
    

    // checkOBJ에가 false 일때 == 중복이거나 유효한 이메일이 아닌경우
    if(!checkObj.authEmail) {
        alert("유효한 이메일 작성 후 클릭해 주세요");
        return;
    }   
    
    sendAuthKeyBtn.disabled = true; // 버튼 클릭 막기(true == 비활성화)
    sendAuthKeyBtn.innerText = "전송 중..."; // 사용자에게 진행 상태 알림               
    authEmail.readOnly = true;// input창 막기

    sendAuthKeyBtn.disabled = true; // 버튼 클릭 막기(true == 비활성화)
    authKeyMessage.innerText = "전송 중..."; // 사용자에게 진행 상태 알림
    
    // 기존에 돌아가던 타이머 멈추기 (중복 방지)
    clearInterval(authTimer);

    // 시간 변수 초기화(4:59)
    min = initMin;
    sec = initSec;

    // 화면에 즉시 "05:00" 표시만
    authKeyMessage.innerText = initTime;
    authKeyMessage.classList.remove("confirm", "error");


    // 비동기로 서버에서 메일보내기 
    fetch("/email/signup",{
        method : "POST",
        headers : {"Content-Type": "application/json"},
        body : JSON.stringify({ "authEmail" : authEmail.value })
    })
    .then(resp => resp.text())
    .then(result => {
        if(result == 1){
            console.log("인증 번호 발송 성공");
            alert("인증번호가 발송되었습니다.");
            // 인증번호 보내기 누를 시 타이머 초기화 시키기!

            min = initMin;
            sec = initSec;
            authKeyMessage.innerText = initTime;
        
            // 1초마다 동작함
            authTimer = setInterval( () => {
        
                authKeyMessage.innerText = `${addZero(min)}:${addZero(sec)}`;
        
                // 0분 0초인 경우 ("00:00" 출력 후)
                if(min == 0 && sec == 0) {
                    checkObj.authKey = false; // 인증 못함
                    clearInterval(authTimer); // interval 멈춤
                    authKeyMessage.classList.add('error');
                    authKeyMessage.classList.remove('confirm');
                    alert("인증시간이 초과되었습니다.");
                    return;
                }
        
                // 0초인 경우(0초를 출력한 후)
                if(sec == 0) {
                    sec = 60;
                    min--;
                }
        
                sec--; // 1초 감소
        
            } , 1000); // 1초 지연시간     
        }else{
            console.log("인증 번호 발송 실패");
            alert("인증번호가 발송 실패되었습니다.");
        }
    })

});
// 전달 받은 숫자가 10 미만인 경우(한자리) 앞에 0 붙여서 반환
function addZero(number) {
    if( number < 10 ) return "0" + number;
    else              return number;
}


// 인증코드 확인
const checkAuthKeyBtn = document.querySelector("#checkAuthKeyBtn"); // 인증하기 버튼
const authKey = document.querySelector("#authKey"); // 인증번호

checkAuthKeyBtn.addEventListener("click" , e=>{

    const inputAuthKey = authKey.value; // 입력한 값 얻어오기

    if(inputAuthKey.trim().length === 0){
        alert("인증번호 작성 후 클릭해주세요.");
        authKeyMessage.classList.remove('confirm', 'error');
        checkObj.authKey = false;
        return;
    }



    fetch("/email/checkAuthKey",{
        method : "POST",
        headers : {"Content-Type": "application/json"},
        body : JSON.stringify({ "authKey" : authKey.value ,"authEmail":authEmail.value})
    })
    .then(resp => resp.text())
    .then(count => {
        if(count == 1){
            console.log("인증번호 일치");
          
            authKeyMessage.innerText="인증번호가 일치합니다";
            authKeyMessage.classList.add("confirm");
            authKeyMessage.classList.remove("error");

            clearInterval(authTimer); // 인증번호 일치한 경우 멈춤

            sendAuthKeyBtn.innerText = "인증완료";
            sendAuthKeyBtn.disabled = true; // 인증번호 보내기 막기

            authKey.readOnly = true;// input 수정 막기
            authEmail.readOnly = true; // 이메일 수정 불가
            checkObj.authKey = true;
        }else{
            console.log("인증번호 불일치");
                 
            authKeyMessage.innerText="인증번호가 일치하지 않습니다";
            authKeyMessage.classList.add("error");
            authKeyMessage.classList.remove("confirm"); 

            clearInterval(authTimer); // 인증번호 일치한 경우 멈춤

            sendAuthKeyBtn.disabled = false;
            authKey.readOnly = false;
            authEmail.readOnly = false;

            checkObj.authKey = false;
        }

        
    })

});

// 아이디 중복 검사 ------------------------------------------------------------------------------------

const memberId = document.querySelector("#memberId");
const idMessage = document.querySelector("#idMessage");

memberId.addEventListener("input",e=>{

    const inputId = e.target.value; // 입력된 값 가져오기

    // 1) 입력된 아이디가 없을 경우
    if(inputId.trim().length === 0) {
        idMessage.innerText = "아이디를 입력해주세요.";
        idMessage.classList.remove('confirm', 'error');
        checkObj.memberId = false;
        return;
    }

    // 6~12 글자 제한(왜 하냐 html에서하면 우회하는 사람이 있을 수 있기에)
    const regExp = /^[a-zA-Z0-9]{6,12}$/;

    if(regExp.test(inputId)){

        fetch("/member/checkId?memberId="+inputId) 
        .then(resp => resp.text()) // text로 받은 이유 단순 이메일 문자라 String으로 받음
        .then(count =>{
     
                if(count == 0){
                    idMessage.innerText = "사용 가능한 아이디입니다.";
                    idMessage.classList.add('confirm');
                    idMessage.classList.remove('error');
                    checkObj.memberId = true; // 형식 o / 중복 x
                }
                else{
                    idMessage.innerText = "이미 사용 중인 아이디입니다.";
                    idMessage.classList.add('error');
                    idMessage.classList.remove('confirm');
                    checkObj.memberId = false;
                }
            
        })
    }else{
        idMessage.innerText = "영어/숫자 6~12 사이로 입력해주세요.";
        idMessage.classList.add('error');
        idMessage.classList.remove('confirm');
        checkObj.memberId = false;
    }


});

// 비밀번호-------------------------------------------------------------------------------------------------

const memberPw = document.querySelector("#memberPw");
const pwMessage = document.querySelector("#pwMessage");


memberPw.addEventListener("input", e=>{

    const inputPw = e.target.value;

    // 입력하지 않은 경우
    if(inputPw.trim().length === 0){
        pwMessage.innerText = "비밀번호를 입력해주세요.";
        pwMessage.classList.remove('confirm', 'error');
        checkObj.memberPw = false;
        return;
    }

    const regExp = /^(?=.*[!@#_-])[a-zA-Z0-9!@#_-]{6,20}$/; // 6~20 특수문자 최소 1개

    // 옮바르게 입력하지 않을 경우
    if(!regExp.test(inputPw)){
        pwMessage.innerText = "사용 불가한 비밀번호 입니다";
        pwMessage.classList.add('error');
        pwMessage.classList.remove('confirm');
        checkObj.memberPw = false;
    }else{
        pwMessage.innerText = "사용 가능한 비밀번호 입니다. ";
        pwMessage.classList.add('confirm');
        pwMessage.classList.remove('error');
        checkObj.memberPw = true;
    }

});

// 비밀번호 확인

const memberPwConfirm = document.querySelector("#memberPwConfirm");
const pwConMessage = document.querySelector("#pwConMessage");

memberPwConfirm.addEventListener("input",e=>{

    const inputPw = memberPw.value; // 비밀번호 확인 시 필요한 비밀번호 값(비교할때 사용)

      // 입력하지 않은 경우
    if(memberPwConfirm.value.trim().length === 0){
        pwConMessage.innerText = "비밀번호 확인을 입력해주세요.";
        pwConMessage.classList.remove('confirm', 'error');
        checkObj.memberPwConfirm = false;
        return;
    }

    if(memberPw.value === memberPwConfirm.value){
        pwConMessage.innerText = "비밀번호가 일치합니다.";
        pwConMessage.classList.add('confirm');
        pwConMessage.classList.remove('error');
        checkObj.memberPwConfirm = true;
    } else {
        pwConMessage.innerText = "비밀번호가 일치하지 않습니다.";
        pwConMessage.classList.add('error');
        pwConMessage.classList.remove('confirm');
        checkObj.memberPwConfirm = false;
    }
});


// 이름 -------------------------------------------------------

const memberName = document.querySelector("#memberName");
const nameMessage = document.querySelector("#nameMessage");

memberName.addEventListener("input",e=>{

    const inputName = e.target.value; // 입력한 값

    if(inputName.trim().length===0){
        nameMessage.innerText="이름을 입력해주세요";
        nameMessage.classList.remove('confirm', 'error');
        checkObj.memberName = false;
        return; 
    }

    const regExp = /^[가-힣]{2,5}$/;

    if(!regExp.test(inputName)){
        nameMessage.innerText = "사용 불가한 이름입니다";
        nameMessage.classList.add('error');
        nameMessage.classList.remove('confirm');
        checkObj.memberName = false;
    }else{
        nameMessage.innerText = "사용 가능한 이름입니다.";
        nameMessage.classList.add('confirm');
        nameMessage.classList.remove('error');
        checkObj.memberName = true;
    }
    
});



// 닉네임 중복 검사 ----------------------------------------------------------------------------------------------

const memberNickname = document.querySelector("#memberNickname");
const nickMessage = document.querySelector("#nickMessage");

memberNickname.addEventListener("input" ,e=>{

    const inputNickname = e.target.value;

    if(inputNickname.trim().length === 0){
        nickMessage.innerText="닉네임을 입력해주세요";
        nickMessage.classList.remove('confirm', 'error');
        checkObj.memberNickname = false;
        return;
    }

    const regExp = /^[a-zA-Z가-힣]{2,8}$/;


    if(regExp.test(inputNickname)){

        fetch("/member/checkNickname?memberNickname="+inputNickname) 
        .then(resp => resp.text()) // text로 받은 이유 단순 이메일 문자라 String으로 받음
        .then(count =>{
     
                if(count == 0){
                    nickMessage.innerText = "사용 가능한 닉네임입니다.";
                    nickMessage.classList.add('confirm');
                    nickMessage.classList.remove('error');
                    checkObj.memberNickname = true; // 형식 o / 중복 x
                }
                else{
                    nickMessage.innerText = "이미 사용 중인 닉네임입니다.";
                    nickMessage.classList.add('error');
                    nickMessage.classList.remove('confirm');
                    checkObj.memberNickname = false;
                }
            

        })
    }else{
        nickMessage.innerText = "2~8 사이로 입력해주세요.";
        nickMessage.classList.add('error');
        nickMessage.classList.remove('confirm');
        checkObj.memberNickname = false;
    }
    
    
});

// 취미 --------------------------------------------------------------------------------------------------------

const subHobbyData = {
    "sports": [
        {id: 101, name: "러닝"}, {id: 102, name: "헬스"}, {id: 103, name: "등산"},
        {id: 104, name: "사이클"}, {id: 105, name: "볼링"}, {id: 106, name: "탁구"},
        {id: 107, name: "수영"}, {id: 108, name: "축구"}, {id: 109, name: "야구"}, {id: 110, name: "골프"}
    ],
    "art": [
        {id: 201, name: "드로잉"}, {id: 202, name: "캘리그라피"}, {id: 203, name: "사진 촬영"},
        {id: 204, name: "영상 편집"}, {id: 205, name: "악기 연주"}, {id: 206, name: "도예/공예"},
        {id: 207, name: "전시회·공연 관람"}
    ],
    "selfDevelop": [
        {id: 301, name: "독서"}, {id: 302, name: "글쓰기"}, {id: 303, name: "코딩"},
        {id: 304, name: "외국어 공부"}, {id: 305, name: "요리"}, {id: 306, name: "재테크/투자"}
    ],
    "social": [
        {id: 401, name: "봉사활동"}, {id: 402, name: "북클럽"}, {id: 403, name: "보드게임 모임"},
        {id: 404, name: "취미 클래스"}, {id: 405, name: "스포츠 동호회"}, {id: 406, name: "스터디 모임"},
        {id: 407, name: "그룹 운동"}
    ],
    "shopping": [
        {id: 501, name: "피규어/굿즈 수집"}, {id: 502, name: "음반/LP 수집"}, {id: 503, name: "향수 수집"},
        {id: 504, name: "패션 아이템 수집"}, {id: 505, name: "문구류 수집"}, {id: 506, name: "한정판/콜라보 수집"}
    ]
};

const mainCategoryArea = document.querySelectorAll("#mainCategoryArea input"); // 메인 카테고리
const CategoryArea = document.querySelector("#CategoryArea"); // 세부 카테고리 도화지
const subTitle = document.querySelector("#subTitle"); 

let selectedHobbySet = new Set(); // 세부 카테고리 저장소 역할


mainCategoryArea.forEach(radio => {
    radio.addEventListener("change", e => { // change :다른 항목을 선택해서 체크 상태 감지
        const selectCategory = e.target.value; 

        CategoryArea.innerHTML = ""; 
        subTitle.style.display = "block"; 

        const subList = subHobbyData[selectCategory]; 

        if (subList) {
            subList.forEach(hobby => { 
                
                // 현재 그리는 hobby.id가 저장소에 있는지 확인
                const isChecked = selectedHobbySet.has(String(hobby.id)) ? "checked" : "";
                // has안에 들어있으면 trun, 없으면 false 선택한 세부 카테고리 저장
                
                // 요소 생성
                const label = document.createElement("label");

                // 1. value에는 DB가 원하는 숫자 ID (${hobby.id})
                // 2. 화면에는 사용자가 볼 이름 (${hobby.name})
                label.innerHTML = `
                    <input type="checkbox" name="hobbyCode" value="${hobby.id}"${isChecked}> ${hobby.name} `; // 취미코드를 이름으로 보여주기 위한 코드
                
                const checkbox = label.querySelector('input')
                checkbox.addEventListener("change" ,e=>{
                    if(e.target.checked){ // 이벤트 벨류가 체크 되어 있을 때
                        selectedHobbySet.add(e.target.value);
                    }else{
                        selectedHobbySet.delete(e.target.value);
                    }
                    console.log("현재 주머니 상태:", Array.from(selectedHobbySet));
                });
                CategoryArea.appendChild(label);
            });
        }
    });
});

//전화번호 ---------------------------------------------------------------------------------------------

const memberTel = document.querySelector("#memberTel");
const telMessage = document.querySelector("#telMessage");

memberTel.addEventListener("input",e=>{

    const inputTel = e.target.value; // 값 얻어오기

    if(inputTel.trim().length === 0){
        telMessage.innerText = "전화번호를 입력해주세요";
        telMessage.classList.remove('confirm', 'error');
        checkObj.memberTel = false;
        return;
    }

    const phoneRegExp = /^010[0-9]{8}$/;

   if(phoneRegExp.test(inputTel)){
        telMessage.innerText ="옳바른 전화번호 입니다.";
        telMessage.classList.add('confirm');
        telMessage.classList.remove('error');
        checkObj.memberTel = true;
   }else{
        telMessage.innerText ="옳바른지 않은 전화번호 입니다.";
        telMessage.classList.add('error');
        telMessage.classList.remove('confirm');
        checkObj.memberTel = false;
   }
    

});

// 가입하기 ------------------------------------------------------------------------------------------------

const signUpForm =document.querySelector("#signUpForm");

// 회원 가입 폼 제출 시
signUpForm.addEventListener("submit", e => {

    
    // form 태그로 제출시 값이 여러개 일 경우 input으로 보내면 편함
    const oldHobbys = signUpForm.querySelectorAll("input[name='hobbyCode']");
    oldHobbys.forEach(input => input.remove());

    // 2. Set 주머니에 담긴 모든 ID를 꺼내서 보이지 않는 input(hidden)으로 생성
    selectedHobbySet.forEach(hobbyId => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "hobbyCode"; // 서버 파라미터 이름
        input.value = hobbyId;    // 취미 번호
        signUpForm.appendChild(input); // 폼 안에 합치기
    });


    for (let key in checkObj) {

        if (!checkObj[key]) { 
            let str;

            switch (key) {
                case "authEmail":       str = "이메일 유효성 검사를 완료해주세요."; break;
                case "authKey":         str = "인증번호가 일치하지 않습니다."; break;
                case "memberId":        str = "아이디가 유효하지 않습니다."; break;
                case "memberPw":        str = "비밀번호가 유효하지 않습니다."; break;
                case "memberPwConfirm": str = "비밀번호 확인이 일치하지 않습니다."; break;
                case "memberName":      str = "이름을 입력해주세요."; break;
                case "memberNickname":  str = "닉네임이 유효하지 않습니다."; break;
                case "memberTel":       str = "전화번호가 유효하지 않습니다."; break;
            }

            alert(str);

            // [핵심 수정] focus 줄 대상을 안전하게 찾기
            let elementId = key;
            if (key === "authEmail") elementId = "memberEmail"; // key는 authEmail이지만 id는 memberEmail임

            const target = document.getElementById(elementId);
            if (target) {
                target.focus();
            }

            e.preventDefault(); // 어떤 경우에도 유효하지 않으면 제출을 막음!
            return;
        }
    }
});







// 주소 검색 버튼 클릭 시
document.querySelector("#searchAddress").addEventListener("click",execDaumPostcode);    

// 다음 주소 API

 function execDaumPostcode() {
        new daum.Postcode({
            oncomplete: function(data) {
                // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

                // 각 주소의 노출 규칙에 따라 주소를 조합한다.
                // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
                var addr = ''; // 주소 변수

                //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
                if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
                    addr = data.roadAddress;
                } else { // 사용자가 지번 주소를 선택했을 경우(J)
                    addr = data.jibunAddress;
                }

                // 우편번호와 주소 정보를 해당 필드에 넣는다.
                document.getElementById('postcode').value = data.zonecode;
                document.getElementById("address").value = addr;
                // 커서를 상세주소 필드로 이동한다.
                document.getElementById("detailAddress").focus();
            }
        }).open();
    }
// 주소 검색 버튼 클릭 시
document.querySelector("#searchAddress").addEventListener("click",execDaumPostcode);