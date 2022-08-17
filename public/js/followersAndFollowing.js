document.addEventListener('DOMContentLoaded', () => {
    if (selectedTab === 'followers') {
        loadFollowers();
    } else {
        loadFollwing();
    }
})

function loadFollowers() {
    fetch(`/api/users/${profileUserId}/followers`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
        })
    .then(res => res.json())
    .then(results => {
        
        outputUsers(results.followers, $(".resultsContainer"));
    })
    .catch(err => {console.log(err)})
};

function loadFollwing() {
    fetch(`/api/users/${profileUserId}/following`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
        })
    .then(res => res.json())
    .then(results => {
        
        outputUsers(results.following, $(".resultsContainer"));
    })
    .catch(err => {console.log(err)})
};

function outputUsers(results, container) {
    container.html("");

    results.forEach(result => {
        const html = createUserHtml(result, true);
        container.append(html);
    })

    if (results.length === 0) {
        container.append("<span class='noResults'>No results found</span>")
    }
};

function createUserHtml(userData, showFolloButton) {
    const name = userData.firstName + " " + userData.lastName;
    const isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    const text = isFollowing ? "Following" : "Follow"
    const buttonClass = isFollowing ? "followButton following" : "followButton"
    // 우리가 렌더링할 사용자가 자신의 프로필이 아닌지 확인
    let followButton = ""
    if (showFolloButton && userLoggedIn._id != userData._id) {
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`
    }
    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}' alt='User's profile picture'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`
}