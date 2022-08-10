
//$(document).ready(() => { alert("안녕하세요!")}); document ready handler 문서 페이지가 준비되고 모든 종속성이 로드될 때까지 사용되거나 실행되지 않는다.
// $("#postTextarea").keyup((e) => { jquery문법을 이용

const submitPostButton = document.querySelector('#submitPostButton');
const postTextarea = document.querySelector('#postTextarea');
const postsContainer = document.querySelector('.postsContainer');
const likeButton = document.querySelector('.likeButton');

postTextarea.addEventListener('keyup', (e) => {

    const textbox = e.target;
    const value = textbox.value.trim(); // textbox.val().trim() 차이가 뭘까?;

    if(submitPostButton.length == 0) return alert("no submit button found")

    if(value == "") {
        submitPostButton.disabled = true;
        return;
    }

    submitPostButton.disabled = false;
});

submitPostButton.addEventListener('click', (e) => {

    const button = e.target;
    const textbox = postTextarea;

    // $.post("/api/posts", {content: textbox.value}, (postData, status, xhr) => {
    //     alert(postData)
    // })
    fetch('/api/posts', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            content: textbox.value
        })
    })
    .then(res => res.json())
    .then(data => {
        const html = createPostHtml(data);
        $(".postsContainer").prepend(html);
        textbox.value = "";
        button.disabled = true;

    })
    .catch(err => {console.log(err)})
});

// 좋아요버튼 구현
// 동적콘텐츠이기 때문에 이 코드가 실행될 때에는 해당 버튼이 페이지에 존재하지 않는다(렌더x). 따라서 이벤트가 발생하지 않음
// likeButton.addEventListener('click', (e) => {
//     const button = e.target;
//     alert('button clicked')
// });

// $(document).on('click', '.likeButton', (e) => {
//     const button = $(e.target);
//     const postId = getPostIdFromElement(button);
    
//     if (postId === undefined) return;

//     $.ajax({
//         url: '/api/posts/${postId}/like',
//         type: 'PUT',
//         success: (postData) => {

//             button.find('span'),text(postData.likes.length || "");

//             if(postData.likes.includes(userLoggedIn._id)) {
//                 button.addClass('active');
//             }
//             else {
//                 button.removeClass('active');
//             }
//         }
//     })
// })

document.addEventListener('click', e => {
    // e.target은 실제 클릭된 요소를 가리킴
    const target = e.target;
    const postId = getPostIdFromElement(target);

    // likeButton
    // button i, button span { pointer-events: none;} CSS 속성을 추가했더니 
    // || target.parentNode.className.includes('likeButton') <= 없어도 button 자식 요소들을 선택해도 무시? button에 해당하는 이벤트가 잘 일어남
    if (target.className.includes('likeButton')) {
        if(postId === undefined) return;

        fetch(`/api/posts/${postId}/like`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
        }).then(res => res.json())
        .then(postData => {
            // if문에서 걸러진 target이 넘어옴
            target.querySelector('span').innerText = postData.likes.length || "";

            if (postData.likes.includes(userLoggedIn._id)) {
                target.classList.add('active');
            }
            else {
                target.classList.remove('active');
            }
            
        })
    };

    // retweetButton
    if (target.className.includes('retweetButton')) {
        if(postId === undefined) return;

        fetch(`/api/posts/${postId}/retweet`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
        }).then(res => res.json())
        .then(postData => {

            target.querySelector('span').innerText = postData.retweetUsers.length || "";

            if (postData.retweetUsers.includes(userLoggedIn._id)) {
                target.classList.add('active');
            }
            else {
                target.classList.remove('active');
            }
            
        })
    }
})

// element의 class가 post인 것을 찾아서 data-id에 담긴 postId를 가져오는 함수
function getPostIdFromElement(element) {
    // const isRoot = element.hasClass('post');
    // const isRoot = element.classList.contiains('post');
    const rootElement = element.className === 'post' ? element : element.closest('.post');
    // const postId = rootElement.data().id;

    // 포스트 이외 곳을 누르면 rootElement의 값이 null이라 오류발생 예외처리
    if (!rootElement) return;

    const postId = rootElement.dataset.id;
    // const postId = rootElement.data('id')

    if(postId === undefined) return alert("Post id undefined");

    return postId;
}

function createPostHtml(postData) {

    if (postData === null) return alert('post object is null');

    // 해당 post가 retweet한 post의 id를 가지고 있다면 true, 아니라면 false
    const isRetweet = postData.retweetData !== undefined;
    // retweet이라면
    const retweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;

    console.log(isRetweet)

    const postedBy = postData.postedBy;

    if (postedBy._id === undefined) {
        return console.log('User object not populated')
    }

    const displayName = postedBy.firstName + " " + postedBy.lastName;
    const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    // 새로고침 하여도 active클래스를 갖게 해서 색상이 적용 되도록 구현
    // payload에서 담겨진 userLoggedIn을 통해서 id를 가져옴
    const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    const retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";

    let retweetText = '';
    if (isRetweet) {
        retweetText = `<span>
                            <i class="fa-solid fa-retweet"></i>
                            Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                        </span>`
    }

    return `<div class='post' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                        </div>
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button>
                                    <i class="fa-regular fa-comment"></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class="fa-solid fa-retweet"></i>
                                    <span>${postData.retweetUsers.length || ""}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class="fa-regular fa-heart"></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

// google serch javascript date to timestamp ago
function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (elapsed/1000 < 30) return "Just now";

         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

// const post = document.createElement('div');
// const mainContentContainer = document.createElement('div');
// const userImageContainer = document.createElement('div');
// const postContentContainer = document.createElement('div');
// const header = document.createElement('div');
// const postBody = document.createElement('div');
// const postFooter = document.createElement('div');

// post.className = 'post'
// mainContentContainer.className = 'mainContentContainer'
// userImageContainer.className = 'userImageContainer'
// postContentContainer.className = 'postContentContainer'
// header.className = 'header'
// postBody.className = 'postBody'
// postFooter.className = 'postFooter'
