
//$(document).ready(() => { alert("안녕하세요!")}); document ready handler 문서 페이지가 준비되고 모든 종속성이 로드될 때까지 사용되거나 실행되지 않는다.
// $("#postTextarea").keyup((e) => { jquery문법을 이용

const submitPostButton = document.querySelector('#submitPostButton');
const postTextarea = document.querySelector('#postTextarea');
const postsContainer = document.querySelector('.postsContainer');

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

function createPostHtml(postData) {

    const postedBy = postData.postedBy;

    const displayName = postedBy.firstName + " " + postedBy.lastName;
    const timestamp = postedBy.createdAt;

    return `<div class='post'>

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
                            <div class='postButtonContainer'>
                                <button>
                                    <i class="fa-solid fa-retweet"></i>
                                </button>
                            </div>
                            <div class='postButtonContainer'>
                                <button>
                                    <i class="fa-regular fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
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
