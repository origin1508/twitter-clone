document.addEventListener('DOMContentLoaded', () => {
    if (selectedTab === 'replies') {
        loadPosts(true);
    } else {
        loadPosts(false);
    }
})

function loadPosts(isReply) {
    fetch(`/api/posts?postedBy=${profileUserId}&isReply=${isReply}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
        })
    .then(res => res.json())
    .then(results => {
        
        outputPosts(results, $(".postsContainer"));
    })
    .catch(err => {console.log(err)})
};

// function loadReplies() {
//     fetch(`/api/posts?postedBy=${profileUserId}&isReply=true`, {
//         method: 'GET',
//         headers: {
//             "Content-Type": "application/json"
//         },
//         })
//     .then(res => res.json())
//     .then(results => {
        
//         outputPosts(results, $(".postsContainer"));
//     })
//     .catch(err => {console.log(err)})
// };