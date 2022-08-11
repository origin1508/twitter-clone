d//$(document).ready(() => { alert("안녕하세요!")}); document ready handler 문서 페이지가 준비되고 모든 종속성이 로드될 때까지 사용되거나 실행되지 않는다.
const submitPostButton = document.querySelector('#submitPostButton');
const postTextarea = document.querySelector('#postTextarea');
const postsContainer = document.querySelector('.postsContainer');
const likeButton = document.querySelector('.likeButton');

// Modal element
const originalPostContainer = document.querySelector('#originalPostContainer');
const replyModal = document.querySelector('#replyModal');
const replyTextarea = document.querySelector('#replyTextarea');
const submitReplyButton = document.querySelector('#submitReplyButton');

// $("#postTextarea", #replayTextarea).keyup((e) => {
//     var textbox = ${e.target};
//     var value = textbox.val().trim();
// }jquery문법을 이용
[postTextarea, replyTextarea].forEach(textarea => {
    textarea.addEventListener('keyup', (e) => {

        const textbox = e.target;
        const value = textbox.value.trim();

        const isModal = textbox.closest('.modal') // 부모방향으로 순회하며 .modal을 찾으면 해당 노드를 없으면 null을 반환
        // var isModal = textbox.parents(".modal").length == 1;
        // null은 불리언에서 거짓으로 취급
        const submitButton = isModal ? submitReplyButton : submitPostButton

        if(submitPostButton.length == 0) return alert("no submit button found")
    
        if(value == "") {
            submitButton.disabled = true;
            return;
        }
    
        submitButton.disabled = false;
    });
}) 
// buttonArray.forEach(button => console.log(button));
// const buttonArray = [submitPostButton, submitReplyButton];
// Array.form(submitPostButton, submitReplyButton).forEach(button => console.log(button));
// [submitReplyButton, submitPostButton].forEach(button => console.log(button));

const buttonArray = [submitPostButton, submitReplyButton];
buttonArray.forEach(submitButton => {
    submitButton.addEventListener('click', (e) => {

        const button = e.target;
        const isModal = button.closest('.modal');
        const textbox = isModal ? replyTextarea : postTextarea;

        const data = {
            content: textbox.value,
        }
    
        if (isModal) {
            // 답장을 하고 있는 게시물을 post하기 직전에 id를 받아와 데이터에 추가 이를 위해 modal이 열릴 때 버튼에 data-id 생성
            const id = button.dataset.id;
            if (id === null) return alert("Button id is null");
            data.replyTo = id;
        }
        
        // $.post("/api/posts", {content: textbox.value}, (postData, status, xhr) => {
        //     alert(postData)
        // })
        fetch('/api/posts', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        })
        .then(res => res.json())
        .then(postData => {

            if (postData.replyTo) {
                location.reload();
            } else {
                const html = createPostHtml(postData);
                $(".postsContainer").prepend(html);
                textbox.value = "";
                button.disabled = true;
            }
                        
        })
        .catch(err => {console.log(err)})
    });
    
})

// reply
// bootstrap이 제공하는 event를 이용
replyModal.addEventListener('show.bs.modal', (e) => {
// $('#replyModal').on('show.bs.modal', () => {})
    const target = e.relatedTarget; // e.target은 modal을 가르킴 개발자도구를 통해 relatedTarget이 button이라는 것을 확인
    const postId = getPostIdFromElement(target);
    // dataset속성을 이용해서 data-id속성에 postId속성값을 가지도록 함
    submitReplyButton.dataset.id = postId;

    fetch(`/api/posts/${postId}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
        })
    .then(res => res.json())
    .then(result => {
        outputPosts(result, $('#originalPostContainer'));
    })
    .catch(err => {console.log(err)})
});

// modal hidden
replyModal.addEventListener('hidden.bs.modal', () => originalPostContainer.innerText = "");

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

//             button.find('span').text(postData.likes.length || "");

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

    // closest메서드를 이용해 클래스명이 post인 요소를 찾을 때까지 부모 방향으로 순회
    const rootElement = element.className === 'post' ? element : element.closest('.post');
    
    // 포스트 이외 곳을 누르면 rootElement의 값이 null이라 오류발생 예외처리
    if (!rootElement) return;

    const postId = rootElement.dataset.id;
    // const postId = rootElement.data().id;

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

    let replyFlag = "";
    if (postData.replyTo) {

        if (!postData.replyTo._id) {
            return alert("ReplyTo is not populated");
        }
        else if (!postData.replyTo.postedBy._id) {
            return alert("Posted by is not pupulated")
        }

        const replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                    </div>`;
    }

    return `<div class='post' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}' alt="User's profile picture">
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <!-- BootStrap 버전에 따라 다를 수 있음 --!>
                                <button type="button" data-bs-toggle="modal" data-bs-target="#replyModal">
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

function outputPosts(results, container) {
    container.innerText = "";

    if (!Array.isArray(results)) {
        results = [results]
    }
    results.forEach(result => {
        const html = createPostHtml(result);
        container.prepend(html);
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
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
